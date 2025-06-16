# products/serializers.py
from rest_framework import serializers
from .models import Product, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'color', 'is_featured', 'order']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    image_colors = serializers.ListField(
        child=serializers.CharField(max_length=10, allow_blank=True), # Allow blank for optional colors
        write_only=True,
        required=False
    )
    removed_images = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'product_type', 
            'available_sizes', # New field here
            'images', 'uploaded_images', 'image_colors', 'removed_images' 
        ]
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        image_colors = validated_data.pop('image_colors', [])
        
        # Pop available_sizes for direct assignment
        available_sizes = validated_data.pop('available_sizes', None)

        product = Product.objects.create(**validated_data)
        
        # Assign available_sizes after product creation
        product.available_sizes = available_sizes
        product.save()

        if len(uploaded_images) != len(image_colors) and image_colors:
            raise serializers.ValidationError("Number of uploaded images and image colors must match.")

        for i, image_file in enumerate(uploaded_images):
            color = image_colors[i] if i < len(image_colors) else None
            ProductImage.objects.create(product=product, image=image_file, color=color)
        
        return product

    def update(self, instance, validated_data):
        # Handle removed images
        removed_image_ids = validated_data.pop('removed_images', [])
        if removed_image_ids:
            images_to_delete = ProductImage.objects.filter(id__in=removed_image_ids, product=instance)
            for img in images_to_delete:
                img.image.delete(save=False) 
                img.delete()

        # Handle new uploaded images and their colors
        uploaded_images = validated_data.pop('uploaded_images', [])
        image_colors = validated_data.pop('image_colors', [])
        
        # Update available_sizes
        instance.available_sizes = validated_data.get('available_sizes', instance.available_sizes)


        if uploaded_images:
            if len(uploaded_images) != len(image_colors) and image_colors:
                raise serializers.ValidationError("Number of new uploaded images and image colors must match.")
            
            for i, image_file in enumerate(uploaded_images):
                color = image_colors[i] if i < len(image_colors) else None
                ProductImage.objects.create(product=instance, image=image_file, color=color)

        # Update product fields
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.price = validated_data.get('price', instance.price)
        instance.product_type = validated_data.get('product_type', instance.product_type)
        instance.save()

        return instance