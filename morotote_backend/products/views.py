from rest_framework import generics, status, viewsets # Import viewsets
from rest_framework.response import Response
from .models import Product, ProductImage
from .serializers import ProductSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser
# from django.core.files.base import ContentFile # No longer needed for direct file handling here
# import uuid # No longer needed for direct uuid generation here
import logging
from django.views.generic import DetailView
# from django.shortcuts import get_object_or_404 # Not directly used in the provided snippet
from django.http import JsonResponse

logger = logging.getLogger(__name__)

# Combine ListCreate and RetrieveUpdateDestroy into a single ModelViewSet
class ProductViewSet(viewsets.ModelViewSet): # Changed to ModelViewSet for simplification
    queryset = Product.objects.prefetch_related('images').all().order_by('-created_at') # Add ordering
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser] # Use list syntax, not tuple if only one item

    # The create and update methods from ModelViewSet will now handle the logic
    # automatically, leveraging the overridden methods in ProductSerializer.
    # You can remove the explicit create and update methods here if they only
    # contained the logic now moved to the serializer.
    
    # If you need custom error handling or specific logging for create/update,
    # you can keep minimal overrides like these:
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"Product created: {serializer.instance.id}")
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            logger.error(f"Error creating product: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            logger.info(f"Product updated: {instance.id}")
            
            # If 'prefetch_related' has been applied, we have to refresh the lookups.
            # This ensures the response includes the latest state of images.
            if getattr(instance, '_prefetched_objects_cache', None):
                instance = self.get_object()
            
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error updating product: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        logger.info(f"Deleting product: {instance.id}")
        
        # Delete associated images from filesystem before deleting the product instance
        for image in instance.images.all():
            try:
                logger.info(f"Deleting image file: {image.image.name}")
                image.image.delete(save=False) # delete the file from storage
            except Exception as e:
                logger.warning(f"Failed to delete image file {image.image.name}: {str(e)}")
        
        self.perform_destroy(instance)
        logger.info(f"Product {instance.id} deleted successfully.")
        return Response(status=status.HTTP_204_NO_CONTENT)


class CustomAuthToken(ObtainAuthToken):
    # This class remains unchanged
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })

class ProductDetailView(DetailView):
    # This class remains unchanged unless you want it to be part of the API
    model = Product
    template_name = 'products/product_detail.html'
    context_object_name = 'product'

    def get(self, request, *args, **kwargs):
        product = self.get_object()
        
        # Build images data with color information
        images_data = []
        for img in product.images.all():
            images_data.append({
                'id': img.id,
                'image': img.image.url,
                'color': img.color, # 'color' is already included in your model
                'is_featured': img.is_featured,
                'order': img.order
            })
        
        return JsonResponse({
            'id': product.id,
            'title': product.title,
            'description': product.description,
            'price': str(product.price),
            'product_type': product.product_type,
            'images': images_data
        })