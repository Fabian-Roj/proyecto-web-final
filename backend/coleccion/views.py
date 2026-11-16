from django.contrib.auth.models import User
from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Carta, Mazo, Coleccion, CartasMazo, CartasColeccion
from .serializers import (
    UserSerializer, CartaSerializer, MazoSerializer,
    ColeccionSerializer, CartasMazoSerializer, CartasColeccionSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class CartaViewSet(viewsets.ModelViewSet):
    queryset = Carta.objects.all()
    serializer_class = CartaSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        nombre = request.data.get('nombre', '').strip()
        existente = Carta.objects.filter(nombre__iexact=nombre).first()
        if existente:
            return Response(self.get_serializer(existente).data, status=status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)


class MazoViewSet(viewsets.ModelViewSet):
    serializer_class = MazoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Mazo.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class ColeccionViewSet(viewsets.ModelViewSet):
    serializer_class = ColeccionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Coleccion.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class CartasMazoViewSet(viewsets.ModelViewSet):
    serializer_class = CartasMazoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = CartasMazo.objects.filter(mazo__usuario=self.request.user)
        mazo_id = self.request.query_params.get('mazo')
        if mazo_id:
            qs = qs.filter(mazo_id=mazo_id)
        return qs


class CartasColeccionViewSet(viewsets.ModelViewSet):
    serializer_class = CartasColeccionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = CartasColeccion.objects.filter(coleccion__usuario=self.request.user)
        col_id = self.request.query_params.get('coleccion')
        if col_id:
            qs = qs.filter(coleccion_id=col_id)
        return qs
    
class MazosPublicosViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MazoSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Mazo.objects.filter(es_public=True)
        comandante = self.request.query_params.get('comandante', '').strip()
        if comandante:
            qs = qs.filter(comandante__icontains=comandante)
        return qs

class CartasMazoPublicoViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CartasMazoSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = CartasMazo.objects.filter(mazo__es_public=True)
        mazo_id = self.request.query_params.get('mazo')
        if mazo_id:
            qs = qs.filter(mazo_id=mazo_id)
        return qs