from django.db import models
from django.contrib.auth.models import User


class Carta(models.Model):
    id_sccrifall = models.CharField(max_length=10, unique=True, null=True, blank=True)
    nombre = models.CharField(max_length=200)
    tipo = models.CharField(max_length=100)
    costo_mana = models.FloatField(default=0)
    es_legal_commander = models.BooleanField(default=True)
    fecha_agregada = models.DateTimeField(auto_now_add=True)
    imagen = models.URLField(max_length=500, blank=True, default='')

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Mazo(models.Model):
    categorias = [
        ('100', 'Commander'),
    ]
    nombre = models.CharField(max_length=200)
    categoria = models.CharField(max_length=3, choices=categorias, default='100')
    comandante = models.CharField(max_length=200, blank=True, default='')
    imagen_comandante = models.URLField(max_length=500, blank=True, default='')
    es_public = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mazos')

    class Meta:
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.nombre} ({self.get_categoria_display()})"


class CartasMazo(models.Model):
    mazo = models.ForeignKey(Mazo, on_delete=models.CASCADE, related_name='cartas_añadidas')
    carta = models.ForeignKey(Carta, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    edicion = models.CharField(max_length=150, blank=True, default='')
    imagen_carta = models.URLField(max_length=500, blank=True, default='')

    class Meta:
        ordering = ['carta__nombre']
        unique_together = ('mazo', 'carta')

    def __str__(self):
        return f"{self.cantidad} x {self.carta.nombre} en {self.mazo.nombre}"


class Coleccion(models.Model):
    nombre = models.CharField(max_length=200)
    carta_port = models.CharField(max_length=200, blank=True, default='')
    imagen_port = models.URLField(max_length=500, blank=True, default='')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='colecciones')

    class Meta:
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"{self.nombre} ({self.usuario.username})"


class CartasColeccion(models.Model):
    coleccion = models.ForeignKey(Coleccion, on_delete=models.CASCADE, related_name='cartas_coleccion')
    carta = models.ForeignKey(Carta, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    edicion = models.CharField(max_length=150, blank=True, default='')
    imagen_carta = models.URLField(max_length=500, blank=True, default='')

    class Meta:
        ordering = ['carta__nombre']
        unique_together = ('coleccion', 'carta')

    def __str__(self):
        return f"{self.cantidad} x {self.carta.nombre} en {self.coleccion.nombre}"