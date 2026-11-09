from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator

class UserSerializer(serializers.ModelSerializer):
    usuario = serializers.CharField(source='username',
                                    validators=[UniqueValidator(queryset=User.objects.all(), message="Este usuario ya está en uso.")])
    contraseña = serializers.CharField(source='password', write_only=True)
    correo = serializers.CharField(source='email')
    
    class Meta:
        model = User
        fields = ['usuario','contraseña','correo']
        extra_kwargs = {'contraseña': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user