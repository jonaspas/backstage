<?php

namespace App\Http\Controllers;

use App\Instrument;
use App\Invitation;
use App\Mail\Invite;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\User;
use Mail;
use Auth;

class UsersController extends GlobalController
{
    public function index() {
        $users = User::with('invitation')->get();
        return view('users',compact('users'));
    }

    public function show($id) {
        $user = User::with('instruments')->with('invitation')->find($id);
        $users_instruments = $user->instruments()->pluck('instruments.id');

        $instruments = Instrument::whereNotIn('id',$users_instruments)->get();

        return view('user',compact('user','instruments'));
    }
    public function store(Request $request) {
        $user = new User();
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->save();

        return back();
    }

    public function update(Request $request, $id) {
        $user = User::find($id);
        $instrument = Instrument::find($request->input('instrument'));

        $already_existing = $user->instruments->contains($instrument->id);
        if (!$already_existing) {
            $user->instruments()->attach([$instrument->id]);
        }

        return back();
    }

    public function destroy($id) {

        $user = User::where('id',$id)->with('casts','songcasts')->first();
	    $user->casts()->delete();
	    if(!empty($user->songcasts)) {
		    foreach($user->songcasts as $songcast) {
			    $songcast->delete();
		    }
	    }
        $user->delete();

        return back();
    }

    public function invite(Request $request) {
	    $active_user = Auth::user();

	 /*   $this->validate( $request, [
		    'email' => 'unique:users',
	    ] );*/

	    $invitationsHandler = new InvitationsController();
	    $invited_user = $invitationsHandler->inviteUser($request);
	    $invitation = $invitationsHandler->store( $active_user, $invited_user);

		Mail::to($request->email)->send(new Invite( $active_user, $invited_user, $invitation->code ));

		return back();
    }
}
