from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (RegisterView, MazoViewSet, ColeccionViewSet, CartaViewSet, CartasMazoViewSet, CartasColeccionViewSet, MazosPublicosViewSet, CartasMazoPublicoViewSet)

router = DefaultRouter()
router.register(r'mazos', MazoViewSet, basename='mazos')
router.register(r'colecciones', ColeccionViewSet, basename='colecciones')
router.register(r'cartas', CartaViewSet, basename='cartas')
router.register(r'cartas-mazo', CartasMazoViewSet, basename='cartas-mazo')
router.register(r'cartas-coleccion', CartasColeccionViewSet, basename='cartas-coleccion')
router.register(r'mazos-publicos', MazosPublicosViewSet, basename='mazos-publicos')
router.register(r'cartas-mazo-publico', CartasMazoPublicoViewSet, basename='cartas-mazo-publico')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', obtain_auth_token, name='login'),
    path('', include(router.urls)),
]