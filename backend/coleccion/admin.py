from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from .models import Carta, Mazo, CartasMazo, Coleccion
# Register your models here.

class MazoInline(admin.TabularInline):
    model = Mazo
    extra = 0
    
class ColeccionInline(admin.TabularInline):
    model = Coleccion
    extra = 0
    
admin.site.unregister(User)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    inlines = [MazoInline, ColeccionInline]
    
admin.site.register(Carta)
admin.site.register(Mazo)
admin.site.register(CartasMazo)
admin.site.register(Coleccion)
