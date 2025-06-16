# products/models.py
from django.db import models

class Product(models.Model):
    PRODUCT_TYPES = [
        ('TOTEBAG', 'Totebag'),
        ('TSHIRT', 'T-Shirt'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    product_type = models.CharField(
        max_length=10,
        choices=PRODUCT_TYPES,
        default='TOTEBAG'
    )
    available_sizes = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="Comma-separated sizes (e.g., S,M,L,XL) for T-shirts"
    ) # New field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class ProductImage(models.Model):
    COLORS = [
        ('WHITE', 'White'),
        ('BLACK', 'Black'),
        ('RED', 'Red'),
        ('BLUE', 'Blue'),
        ('GREEN', 'Green'),
        ('YELLOW', 'Yellow'),
    ]
    
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='product_images/')
    color = models.CharField(
        max_length=10,
        choices=COLORS,
        blank=True,
        null=True
    )
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.product.title} - {self.color or 'No Color'}"