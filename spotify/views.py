from django.shortcuts import render

# Create your views here.
from .credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from rest_framework.views import APIView
from rest_framework.response import Response

class AuthURL(APIView):
    def get(self,request,format=None):
        pass