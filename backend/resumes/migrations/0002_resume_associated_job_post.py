# Generated by Django 4.2.21 on 2025-05-29 01:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('jobposts', '0001_initial'),
        ('resumes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='resume',
            name='associated_job_post',
            field=models.ForeignKey(blank=True, help_text='The specific job post this resume is tailored for or associated with.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='associated_resumes', to='jobposts.jobpost'),
        ),
    ]
