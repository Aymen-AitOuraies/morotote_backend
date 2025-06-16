# products/urls.py
from django.urls import path, include # Import include
from rest_framework.routers import DefaultRouter # Import DefaultRouter
from .views import ProductViewSet, CustomAuthToken, ProductDetailView # Import ProductViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet) # Register ProductViewSet

urlpatterns = [
    path('api/', include(router.urls)), # Include router URLs
    path('api/auth/login/', CustomAuthToken.as_view(), name='api-login'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-page'),
]