from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, ReadingList
from books.serializers import BookSerializer


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        UserProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class ReadingListSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)

    class Meta:
        model = ReadingList
        fields = ('id', 'book', 'saved_at')