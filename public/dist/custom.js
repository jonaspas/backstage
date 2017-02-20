'use strict';

var pathArray = location.href.split('/');
var protocol = pathArray[0];
var host = pathArray[2];
var baseurl = protocol + '//' + host + '/';

/*
plyr.setup({
	controls: ['current-time','play','progress'],
});
*/

var app = new Vue({
	el: '#backstage',
	delimiters: ['[[', ']]'],
	data: {
		songForm: false,
		userForm: false,
		instrumentForm: false,
		message: 'Hello Vue!',
		instrumentsInSong: [],
		instrumentUser: '',
		instruments: '',
		song: 'test',
		selectedInstrument: '',
		selectedInstrumentUser: '',
		justAddingInstrument: false,
		info: '',
		sortedSongcasts: '',
		fileChosen: false,
		attachmenttypes: [],
		someValue: false,
		attachmenttypeChosen: false,
		fileupload: '',
		songattachments: [],
		metaEdit: false,
		justAddingAttachment: false,
		percentCompleted: 0,
		justUploading: false,
		attachment_comment: ''
	},
	mounted: function mounted() {
		var _this = this;
		axios.get(baseurl + 'api/instruments').then(function (response) {
			_this.instruments = response.data;
		});

		axios.get(baseurl + 'api/song/' + pathArray[4]).then(function (response) {
			_this.song = response.data;
		});

		axios.get(baseurl + 'api/attachmenttypes').then(function (response) {
			_this.attachmenttypes = response.data;
		});

		axios.get(baseurl + 'api/attachments-by-type/' + pathArray[4]).then(function (response) {
			_this.songattachments = response.data;
		});
	},
	methods: {
		contains: function contains(needle, haystack) {
			if (haystack) {
				if (haystack.includes(needle)) {
					this.someValue = true;
				}
			}
		},
		sortSongcasts: function sortSongcasts(a, b) {
			if (a.cast.instrument.name < b.cast.instrument.name) return -1;
			if (a.cast.instrument.name > b.cast.instrument.name) return 1;
			return 0;
		},
		songUpdate: function songUpdate(song_id) {
			var _this = this;
			axios.patch(baseurl + 'songs/' + song_id, _this.song).then(function (response) {
				_this.song = response.data;
				_this.metaEdit = false;
			}).catch(function (error) {
				console.log(error);
			});
		},
		instrumentAdd: function instrumentAdd() {
			this.instrumentsInSong.push('asd');
			this.justAddingInstrument = true;
		},
		instrumentRemove: function instrumentRemove(index) {
			alert(index);
			this.instrumentsInSong.splice(index, 1);
		},
		instrumentSelectToggle: function instrumentSelectToggle(instrument) {
			this.selectedInstrumentUser = '';
			if (instrument == this.selectedInstrument) {
				return this.selectedInstrument = '';
			}
			this.selectedInstrument = '';
			this.selectedInstrument = instrument;
		},
		instrumentUserSelectToggle: function instrumentUserSelectToggle(user) {
			this.selectedInstrumentUser = '';
			this.selectedInstrumentUser = user;
		},
		instrumentAddCancel: function instrumentAddCancel() {
			this.justAddingInstrument = false;
			this.instrumentsInSong = [];
			this.selectedInstrument = '';
			this.selectedInstrumentUser = '';
		},
		songcastSave: function songcastSave(song_id, instrument, user) {
			var _this = this;
			axios.get(baseurl + 'songcast/add/' + song_id + '/' + instrument.id + '/' + user.id).then(function (response) {
				if (response.data) {
					_this.song.songcasts.push(response.data);
					_this.justAddingInstrument = false;
					_this.instrumentsInSong = [];
					_this.selectedInstrument = '';
					_this.selectedInstrumentUser = '';
				}
			}).catch(function (error) {
				console.log(error);
				_this.info = true;
				setTimeout(function () {
					_this.info = false;
				}, 3000);
			});
		},
		songcastDelete: function songcastDelete(songcast, index) {
			var _this = this;
			if (songcast.id) {
				axios.delete(baseurl + 'songcasts/' + songcast.id).then(function (response) {
					_this.song.songcasts.splice(index, 1);
				}).catch(function (error) {
					_this.song.songcasts.splice(index, 1);
				});
			}
		},

		attachmentAdd: function attachmentAdd() {
			var _this = this;

			var output = document.getElementById('output');
			var data = new FormData();
			data.append('file', document.getElementById('file').files[0]);
			data.append('type', _this.attachmenttypeChosen);
			data.append('song_id', _this.song.id);
			data.append('comment', _this.attachment_comment);

			var typeindex = _this.songattachments.findIndex(function (x) {
				return x.id == _this.attachmenttypeChosen;
			});

			var config = {
				onUploadProgress: function onUploadProgress(progressEvent) {
					_this.justUploading = true;
					_this.percentCompleted = Math.round(progressEvent.loaded * 100 / progressEvent.total);
				}
			};

			axios.post(baseurl + 'attachments', data, config).then(function (response) {
				_this.songattachments[typeindex].attachments.unshift(response.data);
				_this.endAddingAttachment();
			}).catch(function (err) {
				console.log(err.message);
				_this.endAddingAttachment();
				alert('Entschuldigung, es gab ein Fehler beim Upload :/');
			});
		},

		endAddingAttachment: function endAddingAttachment() {
			this.justUploading = false;
			this.justAddingAttachment = false;
			this.percentCompleted = 0;
			this.attachmenttypeChosen = false;
			this.fileChosen = false;
			this.attachment_comment = '';
		},

		attachmentDelete: function attachmentDelete(attachment, index, attachmenttype_id) {
			var _this = this;

			var confirmAnswer;
			function confirm1() {
				confirmAnswer = confirm("Wollen Sie diese Seite wirklich sehen?");
			}
			confirm1();

			console.log(confirmAnswer);
			if (confirmAnswer == false) {
				return false;
			}

			var typeindex = _this.songattachments.findIndex(function (x) {
				return x.id == attachmenttype_id;
			});

			axios.delete(baseurl + 'attachments/' + attachment.id).then(function (response) {
				_this.songattachments[typeindex].attachments.splice(index, 1);
			}).catch(function (error) {
				_this.songattachments[typeindex].attachments.splice(index, 1);
			});
		},

		fileExistCheck: function fileExistCheck(event) {
			this.fileChosen = event.target.files[0];
		}
	}
});