pathArray = location.href.split( '/' );
protocol = pathArray[0];
host = pathArray[2];
baseurl = protocol + '//' + host + '/';

var app = new Vue({
	el: '#backstage',
	delimiters: ['[[', ']]'],
	data: {
		songForm: false,
		message: 'Hello Vue!',
		instrumentsInSong: [],
		instrumentUser: '',
		instruments: '',
		song: '',
		selectedInstrument: '',
		selectedInstrumentUser: '',
		justAddingInstrument: false,
		info: ''
	},
	mounted: function() {
		var _this = this;
		axios.get(baseurl + 'api/instruments').then(function (response) {
			_this.instruments = response.data;
		});

		axios.get(baseurl + 'api/song/' + pathArray[4]).then(function (response) {
			_this.song = response.data;
		});
	},
	methods: {
		test: function(input) {
			alert(input)
		},
		instrumentAdd: function() {
			this.instrumentsInSong.push('asd');
			this.justAddingInstrument = true;
		},
		instrumentRemove: function(index) {
			alert(index);
			this.instrumentsInSong.splice(index,1);
		},
		instrumentSelectToggle: function(instrument) {
			this.selectedInstrumentUser = '';
			if(instrument == this.selectedInstrument) {
				return this.selectedInstrument = '';
			}
			this.selectedInstrument = '';
			this.selectedInstrument = instrument;
		},
		instrumentUserSelectToggle: function(user) {
			this.selectedInstrumentUser = '';
			this.selectedInstrumentUser = user;
		},
		songcastSave: function(song_id,instrument,user) {
			var _this = this;
			axios.get(baseurl + 'song-cast-add/' + song_id + '/' + instrument.id + '/' + user.id)
				.then(function (response) {
					if(response.data) {
						_this.song.songcasts.push(response.data);
						_this.justAddingInstrument = false;
						_this.instrumentsInSong = [];
						_this.selectedInstrument = '';
						_this.selectedInstrumentUser = '';
					}
				})
				.catch(function (error) {
					console.log(error);
					_this.info = true;
					setTimeout(function(){
						_this.info = false;
					}, 3000);
				});
		}
	}
})