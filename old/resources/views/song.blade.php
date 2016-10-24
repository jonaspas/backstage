@extends('app')

@section('content')
    <h2>Update Song {{$song->name}}</h2>

    @if (Session::get('song_name'))
        Den Song {{Session::get('song_name')}} bearbeiten:
    @endif

    <form action="{{$baseurl}}/song/update/{{$song->id}}" method="post">
        {{csrf_field()}}
        <input name="name" type="text" value="{{$song->name}}">
        <button type="submit">Update</button>
    </form>

@endsection