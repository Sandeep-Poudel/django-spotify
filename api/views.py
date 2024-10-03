from rest_framework import generics
from rest_framework.views import APIView
from .serializers import roomSerializer, createRoomSerializer, updateRoomSerializer
from .models import Room
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = roomSerializer


class GetRoom(APIView):
    serializer_class = roomSerializer
    lookup_url_kwarg = "code"

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code is not None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = roomSerializer(room[0]).data
                data["isHost"] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response(
                {"Room not Found": "Invalid Room Code"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            {"Bad Request": "Code parameter not found in request"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class JoinRoom(APIView):
    def post(self, request, format=None):
        lookup_url_kwarg = "code"
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        code = request.data.get(lookup_url_kwarg)
        if code is not None:
            roomResult = Room.objects.filter(code=code)
            if len(roomResult) > 0:
                self.request.session["roomCode"] = code
                return Response({"message": "Room Joined"}, status=status.HTTP_200_OK)
            return Response(
                {"Bad Request": "Invalid Room Code"}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(
            {"Bad Request": "Invalid post data, did not find a code key"},
            status=status.HTTP_400_BAD_REQUEST,
        )


class CreateRoomView(APIView):
    serializer_class = createRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guestCanPause = serializer.data.get("guestCanPause")
            votesToSkip = serializer.data.get("votesToSkip")
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guestCanPause = guestCanPause
                room.votesToSkip = votesToSkip
                room.save(update_fields=["guestCanPause", "votesToSkip"])
                self.request.session["roomCode"] = room.code
                return Response(roomSerializer(room).data, status=status.HTTP_200_OK)
            else:
                room = Room(
                    host=host, guestCanPause=guestCanPause, votesToSkip=votesToSkip
                )
                room.save()
                self.request.session["roomCode"] = room.code
                return Response(
                    roomSerializer(room).data, status=status.HTTP_201_CREATED
                )
        return Response(
            {"Bad Request": "Invalid data..."}, status=status.HTTP_400_BAD_REQUEST
        )


class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        data = {"code": self.request.session.get("roomCode")}
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, format=None):
        if "roomCode" in self.request.session:
            self.request.session.pop("roomCode")
            hostId = self.request.session.session_key
            roomResult = Room.objects.filter(host=hostId)
            if len(roomResult) > 0:
                room = roomResult[0]
                room.delete()
        return Response({"Message": "Success"}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = updateRoomSerializer

    def patch(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guestCanPause = serializer.data.get("guestCanPause")
            votesToSkip = serializer.data.get("votesToSkip")
            code = serializer.data.get("code")
            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response(
                    {"msg": "Room not found"}, status=status.HTTP_404_NOT_FOUND
                )
            room = queryset[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response(
                    {"msg": "You are not the host of this room"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            room.guestCanPause = guestCanPause
            room.votesToSkip = votesToSkip
            room.save(update_fields=["guestCanPause", "votesToSkip"])
            return Response(roomSerializer(room).data, status=status.HTTP_200_OK)

        return Response(
            {"Bad Request": "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST
        )
