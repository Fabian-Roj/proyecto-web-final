from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator
from .models import Carta, Mazo, Coleccion, CartasMazo, CartasColeccion


class UserSerializer(serializers.ModelSerializer):
    usuario = serializers.CharField(
        source='username',
        validators=[UniqueValidator(queryset=User.objects.all(), message="Este usuario ya está en uso.")]
    )
    contraseña = serializers.CharField(source='password', write_only=True)
    correo = serializers.CharField(source='email')

    class Meta:
        model = User
        fields = ['usuario', 'contraseña', 'correo']
        extra_kwargs = {'contraseña': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user


class CartaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carta
        fields = ['id', 'nombre', 'tipo', 'costo_mana', 'es_legal_commander', 'imagen', 'fecha_agregada']
        read_only_fields = ['id', 'fecha_agregada']


class MazoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='get_categoria_display', read_only=True)
    creador = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Mazo
        fields = ['id', 'nombre', 'categoria', 'categoria_nombre', 'comandante', 'imagen_comandante', 'es_public', 'fecha_creacion', 'creador']
        read_only_fields = ['id', 'fecha_creacion', 'creador']

    def validate_nombre(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("El nombre del mazo debe tener por lo menos 3 caracteres")
        return value.strip()


class ColeccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coleccion
        fields = ['id', 'nombre', 'carta_port', 'imagen_port', 'fecha_creacion']
        read_only_fields = ['id', 'fecha_creacion']

    def validate_nombre(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("El nombre de la coleccion debe tener al menos 3 caracteres")
        return value.strip()


class CartasMazoSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='carta.nombre', read_only=True)
    costo_mana = serializers.FloatField(source='carta.costo_mana', read_only=True)
    imagen_final = serializers.SerializerMethodField()

    class Meta:
        model = CartasMazo
        fields = ['id', 'mazo', 'carta', 'nombre', 'costo_mana', 'cantidad', 'edicion', 'imagen_carta', 'imagen_final']

    def get_imagen_final(self, objeto):
        return objeto.imagen_carta or objeto.carta.imagen


class CartasColeccionSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='carta.nombre', read_only=True)
    costo_mana = serializers.FloatField(source='carta.costo_mana', read_only=True)
    imagen_final = serializers.SerializerMethodField()

    class Meta:
        model = CartasColeccion
        fields = ['id', 'coleccion', 'carta', 'nombre', 'costo_mana', 'cantidad', 'edicion', 'imagen_carta', 'imagen_final']

    def get_imagen_final(self, objeto):
        return objeto.imagen_carta or objeto.carta.imagen