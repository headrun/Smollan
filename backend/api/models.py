from django.db import models


class Kpi(models.Model):
    id = models.AutoField(db_column='ID', primary_key=True)
    countrycode = models.CharField(max_length=100, blank=True, null=True)
    project = models.CharField(max_length=20, blank=True, null=True)
    moc = models.CharField(max_length=10, blank=True, null=True)
    day = models.DateField(blank=True, null=True)
    attendance_achvd = models.IntegerField(blank=True, null=True)
    attendance_target = models.IntegerField(blank=True, null=True)
    vacancy = models.IntegerField(blank=True, null=True)
    vacancy_bracket = models.IntegerField(blank=True, null=True)
    outlets_assigned = models.IntegerField(blank=True, null=True)
    outlets_done = models.IntegerField(blank=True, null=True)
    outlets_additional = models.IntegerField(blank=True, null=True)
    outlets_total = models.IntegerField(blank=True, null=True)
    tasks_assigned = models.IntegerField(blank=True, null=True)
    tasks_done = models.IntegerField(blank=True, null=True)
    osa_target = models.IntegerField(blank=True, null=True)
    osa_available = models.IntegerField(blank=True, null=True)
    osa_nonavailable = models.IntegerField(blank=True, null=True)
    promo_target = models.IntegerField(blank=True, null=True)
    promo_available = models.IntegerField(blank=True, null=True)
    promo_nonavailable = models.IntegerField(blank=True, null=True)
    pop_target = models.IntegerField(blank=True, null=True)
    pop_available = models.IntegerField(blank=True, null=True)
    pop_nonavailable = models.IntegerField(blank=True, null=True)
    npd_target = models.IntegerField(blank=True, null=True)
    npd_available = models.IntegerField(blank=True, null=True)
    npd_nonavailale = models.IntegerField(blank=True, null=True)
    att_per = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = 'kpi'
        managed = True

