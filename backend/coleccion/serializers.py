from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    usuario = serializers.CharField(source='username')
    contraseña = serializers.CharField(source='password', write_only=True)
    correo = serializers.CharField(source='email')
    
    class Meta:
        model = User
        fields = ['usuario','contraseña','correo']
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user