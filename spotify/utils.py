from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post, put, get
import base64

BASE_URL = "https://api.spotify.com/v1/me/"


def getUserTokens(sessionId):
    tokens = SpotifyToken.objects.filter(user=sessionId)
    if tokens.exists():
        return tokens[0]
    return None




def updateOrCreateUserTokens(
    sessionId, accessToken, tokenType, expiresIn, refreshToken
):
    tokens = getUserTokens(sessionId)
    expiresIn = timezone.now() + timedelta(seconds=expiresIn)

    if tokens:
        tokens.accessToken = accessToken
        tokens.expiresIn = expiresIn
        tokens.refreshToken = refreshToken
        tokens.tokenType = tokenType
        tokens.save(
            update_fields=["accessToken", "refreshToken", "expiresIn", "tokenType"]
        )
    else:
        tokens = SpotifyToken(
            user=sessionId,
            accessToken=accessToken,
            refreshToken=refreshToken,
            tokenType=tokenType,
            expiresIn=expiresIn,
        )
        tokens.save()


def isSpotifyAuthenticated(sessionId):
    tokens = getUserTokens(sessionId)
    if tokens:
        expiry = tokens.expiresIn

        if expiry <= timezone.now():
            print(expiry, timezone.now())
            refreshSpotifyToken(sessionId)
        return True
    return False


def refreshSpotifyToken(sessionId):
    refreshToken = getUserTokens(sessionId).refreshToken
    
    if not refreshToken:
        return {'Error': 'No refresh token available'}

    try:
        response = post(
            "https://accounts.spotify.com/api/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": refreshToken,
                'client_id': CLIENT_ID,
                'client_secret':CLIENT_SECRET
            }
        ).json()

        if(response.get('error')):
            return {'Error': 'Error refreshing access token'}
        
        accessToken = response.get("access_token")
        tokenType = response.get("token_type")
        expiresIn = response.get("expires_in")



        updateOrCreateUserTokens(sessionId, accessToken, tokenType, expiresIn, refreshToken)

    except Exception as e:
        # Handle any exception related to the request
        return {'Error': 'Error refreshing access token'}


def executeSpotifyApiRequest(sessionId, endpoint, post_=False, put_=False):
    if(not isSpotifyAuthenticated(sessionId)):
        refreshSpotifyToken(sessionId)

    tokens = getUserTokens(sessionId)
    headers = {
        "Content-Type": "application/json",
        "Authorization": f'Bearer {tokens.accessToken}',
    }
    if post_:
        print("POST")
        post(BASE_URL + endpoint, headers=headers)

    if put_:
        print("PUT")
        put(BASE_URL + endpoint, headers=headers)

    response = get(BASE_URL + endpoint, {}, headers=headers)
    
    try:
        return response.json()
    except Exception:
        return {"Error": "Issue with request.", "status": response.status_code}


def playSong(sessionId):
    print("play song ")
    return executeSpotifyApiRequest(sessionId, endpoint="player/play", put_=True)

def pauseSong(sessionId):
    print("pause song")
    return executeSpotifyApiRequest(sessionId, endpoint="player/pause", post_=True)

def skipSong(sessionId):
    return executeSpotifyApiRequest(sessionId, endpoint="player/next", post_=True)