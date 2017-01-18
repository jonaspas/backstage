<?php

namespace App\Http\Controllers;

use App\Instrument;
use App\Songcast;
use App\User;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Song;
use Illuminate\Support\Facades\DB;
use Session;

class SongsController extends GlobalController
{
    protected $dates = ['deleted_at'];

    protected $filehandler;

    public function __construct() {
	    $this->filehandler = new AttachmentsController();
    }

	public function store(Request $request) {
        $song = new Song();
        $song->name = $request->input('name');
        $song->save();

        return back();
    }

    public function index() {
        $songs = Song::with('songcasts.cast.user','songcasts.cast.instrument')->get();
	    $this->filehandler = new AttachmentsController();
        return view('songs', compact('songs'));
    }
    public function show($song_id) {
        $users = User::all();
        $instruments = Instrument::with('users')->get();
	    $song = Song::with('attachments')
	                ->with('songcasts.cast.instrument','songcasts.cast.user')
	                ->find($song_id);

        return view('song', compact('song','users','instruments'));
    }
    public function showAPI($song_id) {
        $song = Song::with('attachments')
            ->with('songcasts.cast.instrument', 'songcasts.cast.user')
            ->find($song_id);

        return $song;
    }

	public function update(Request $request, $song_id) {
		$song = Song::find($song_id);

		$file = $request->file('file');
		if ($file) {
			$this->filehandler->store($file, 'uploads', $song_id);
		}

		saverLoop($request,$song,
			['name','key','duration','link_to_original','original_performer','extrainfo']);
		$song->save();

		return back();
	}
    public function destroy($song_id) {
        $song = Song::find($song_id);
        $song_name = (string)$song->name;
        $song->delete();

        Session::flash('song_name', $song_name);
        return back();
    }
}
