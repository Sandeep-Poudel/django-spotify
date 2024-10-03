from rest_framework import serializers
from .models import Room

class roomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields= ('id','code','host', 'guestCanPause','votesToSkip','createdAt')

class createRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields= ("guestCanPause","votesToSkip")

class updateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])
    class Meta:
        model = Room 
        fields = ("guestCanPause","votesToSkip","code")