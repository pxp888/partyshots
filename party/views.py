from django.shortcuts import render, get_object_or_404, redirect

# Create your views here.
def homepage(request):
    context = {

    }
    return render(request, 'party/home.html', context)

def create(request):
    context = {

    }
    return render(request, 'party/create.html', context)


def chooser(request):
    context = {

    }
    return render(request, 'party/chooser.html', context)

def viewer(request):
    context = {

    }
    return render(request, 'party/viewer.html', context)

