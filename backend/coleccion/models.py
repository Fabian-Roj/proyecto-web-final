from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Carta(models.Model):
    nombre = models.CharField(max_length=200)
    tipo = models.CharField(max_length=100)
    costo_mana = models.IntegerField()
    es_legal_commander = models.BooleanField(default=True)
    fecha_agregada = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['nombre']
        
    def __str__(self):
        return self.nombre
    
class Mazo(models.Model):
    categorias = [
        ('100', 'Commander'),
    ]
    nombre = models.CharField(max_length=200)
    categoria = models.CharField(max_length=3, choices=categorias)
    es_public = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        ordering = ['-fecha_creacion']
        
    def __str__(self):
        return f"{self.nombre} ({self.get_categoria_display()})"
    
class CartasMazo(models.Model):
    mazo = models.ForeignKey(Mazo, on_delete=models.CASCADE, related_name='cartas_añadidas')
    carta = models.ForeignKey(Carta, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    
    class Meta:
        ordering = ['carta__nombre']
        unique_together = ('mazo', 'carta')
        
    def __str__(self):
        return f"{self.cantidad} x {self.carta.nombre} en {self.mazo.nombre}"
    
class Coleccion(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coleccion')
    carta = models.ForeignKey(Carta, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    
    class Meta:
        ordering = ['carta__nombre']
        unique_together = ('usuario', 'carta')
        
    def __str__(self):
        return  f"{self.usuario.username}: {self.cantidad} x {self.carta.nombre}"
