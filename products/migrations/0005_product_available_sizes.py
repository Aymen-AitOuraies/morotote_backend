# Generated by Django 5.2.2 on 2025-06-11 17:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_productimage_color'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='available_sizes',
            field=models.CharField(blank=True, help_text='Comma-separated available sizes (e.g., S,M,L,XL). Only for T-shirts.', max_length=100, null=True),
        ),
    ]
