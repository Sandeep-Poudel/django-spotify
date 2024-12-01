from django.shortcuts import redirect

# Create your views here.
from .credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .utils import executeSpotifyApiRequest,updateOrCreateUserTokens,isSpotifyAuthenticated,playSong,pauseSong,skipSong
from api.models import Room
from .models import Vote


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing"
        url = (
            Request(
                "GET",
                "https://accounts.spotify.com/authorize",
                params={
                    "scope": scopes,
                    "response_type": "code",
                    "redirect_uri": REDIRECT_URI,
                    "client_id": CLIENT_ID,
                },
            )
            .prepare()
            .url
        )
        return Response({"url": url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get("code")
    error = request.GET.get("error")

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    accessToken = response.get("access_token")
    tokenType = response.get("token_type")
    refreshToken = response.get("refresh_token")
    expiresIn = response.get("expires_in")
    error = response.get("error")

    if not request.session.exists(request.session.session_key):
        request.session.create()

    updateOrCreateUserTokens(
        request.session.session_key,
        accessToken=accessToken,
        refreshToken=refreshToken,
        tokenType=tokenType,
        expiresIn=expiresIn,
    )
    return redirect('frontend:')


class IsAuthenticated(APIView):
    def get(self,request,format=None):
        is_authenticated = isSpotifyAuthenticated(self.request.session.session_key)
        return Response({"status":is_authenticated},status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        roomCode = self.request.session.get('roomCode')
        room = Room.objects.filter(code=roomCode)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player/currently-playing"
        response = executeSpotifyApiRequest(host, endpoint)
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        albumCover = item.get('album').get('images')[0].get('url')
        isPlaying = response.get('is_playing')
        songId = item.get('id')
        

        artistString = ", ".join([artist.get('name') for artist in item.get('artists')])
        
        votes = len(Vote.objects.filter(room= room,songId = songId))

        song = {
            'title': item.get('name'),
            'artist': artistString,
            'duration': duration,
            'time': progress,
            'image_url': albumCover,
            'is_playing': isPlaying,
            'votes': votes,
            "votesToSkip":room.votesToSkip,
            'id': songId
        }

        self.updateRoomSong(room,songId)
        return Response(song, status=status.HTTP_200_OK)
    
    def updateRoomSong(self,room,songId):
        currentSong = room.currentSong
        if currentSong != songId:
            room.currentSong = songId
            room.save(update_fields=['currentSong'])
            votes = Vote.objects.filter(room=room).delete()

class PauseSong(APIView):
    def put(self,response,format=None):
        roomCode = self.request.session.get("roomCode")
        room = Room.objects.filter(code = roomCode).first()
        if self.request.session.session_key == room.host or room.guestCanPause:
            print(pauseSong(room.host))
            return Response({},status=status.HTTP_204_NO_CONTENT)
        return Response({},status=status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    def put(self,response,format=None):
        roomCode = self.request.session.get("roomCode")
        room = Room.objects.filter(code = roomCode).first()
        if self.request.session.session_key == room.host or room.guestCanPause:
            print(playSong(room.host))
            return Response({},status=status.HTTP_204_NO_CONTENT)
        return Response({},status=status.HTTP_403_FORBIDDEN)
    

class SkipSong(APIView):
    def post(self , request , format=None):
        roomCode = self.request.session.get('roomCode')
        room = Room.objects.filter(code = roomCode).first()
        votes = Vote.objects.filter(room= room,songId = room.currentSong)
        votesNeeded = room.votesToSkip

        if self.request.session.session_key == room.host or len(votes) + 1 >= votesNeeded:
            votes.delete()
            skipSong(room.host)
        else :
            existingVote =  Vote.objects.filter(user=self.request.session.session_key, room=room, songId=room.currentSong).first()
            if existingVote:
                return Response({"error": "You have already voted to skip this song."}, status=status.HTTP_400_BAD_REQUEST)

            vote = Vote(user=self.request.session.session_key,room=room , songId = room.currentSong)
            vote.save()
        return Response({},status=status.HTTP_204_NO_CONTENT)