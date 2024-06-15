from django.shortcuts import render, get_object_or_404, redirect

# Create your views here.
def homepage(request):
    context = {

    }
    return render(request, 'party/home.html', context)

