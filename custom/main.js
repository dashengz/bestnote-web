$(function(){
    // Fixed Navigation
    $('#content-wrap').scroll(function(){
        if ($('#content-wrap').scrollTop() > 120) {
            $('.menu-btn').addClass("fixed");
        } else {
            $('.menu-btn').removeClass("fixed");
        }
        if ($('#content-wrap').scrollTop() > 136) {
            $('.nav-menu').addClass("fixed");
        } else {
            $('.nav-menu').removeClass("fixed");
        }
    });
    
    // Menu item clicked effect
    $('.nav-menu-link').click(function(){
        var p = $(this).parent();
        p.addClass('nav-menu-item-current');
        p.siblings().removeClass('nav-menu-item-current');
        smoothTo('#' + $(this).attr('id').split('-')[1] + '-section');
        setTimeout(function(){p.removeClass('nav-menu-item-current')}, 1000);
    });

    // Cursor change
    $('#open-btn').click(function(){
        $('.main-container').addClass('show-menu');
        $('.content-wrap').css('cursor', 'pointer');
    });
    
    $('#close-btn, .content-wrap').click(function(){
        $('.main-container').removeClass('show-menu');
        $('.content-wrap').css('cursor', 'initial');
    });
    
    // Change Font Family
    var r = 0;
    function changeFontFamily() {
        var f = ["'Gochi Hand', cursive", "'Ubuntu Condensed', sans-serif", "'Waiting for the Sunrise', cursive", "'Indie Flower', cursive"];
        $('body').css('font-family', f[r]);
        r++;
        if (r == 4) r = 0;
    }
    $('#settings-btn').click(function(){
        changeFontFamily();
    });

    // Logout btn
    $('#logout-btn').click(function() {
        firebase.auth().signOut();
    });

    // Create Pad Style & Focus
    $('#create-note-title').focus();
    autosize($('#create-note-pad'));

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            showUserInfo(user);
            initializeEntries(user);
        } else {
            // No user is signed in.
            $(location).attr('href', 'index.html');
        }
    });

    function smoothTo(target) {
        var d = $(target).position().top - ($('.nav-menu').hasClass('fixed') ? 56 : 111);
        if (target == '#create-section') d = 0;
        $('#content-wrap').animate({
            scrollTop: d
        }, 1000);
    }

    function showUserInfo(user) {
        if ($('#menu-username').text() == '') {
            $('#menu-username').text(user.displayName);
            $('.profile img').attr('src', user.photoURL);
        }
    }

    var noteItemTemplate = 
        '<div class="note-item-wrap child-item with-shadow">' +
            '<div class="note-item-title">' +
            '</div>' +
            '<div class="note-item-time">' +
            '</div>' +
            '<div class="note-item-note">' +
            '</div>' +
        '</div>';

    var imageItemTemplate = 
        '<a class="light-box-link" data-lightbox="gallery-collections">' +
            '<div class="image-item-wrap child-item with-shadow">' +
                '<img class="img-responsive" />' +
                '<div class="image-item-title">' +
                '</div>' +
            '</div>' +
        '</a>';

    function initializeEntries(user) {
        if ($('#notes-wrap').html() == '') {
            firebase.database().ref(user.uid + '/notes').once('value', function(snapshot) {
                var data = snapshot.val();
                for (n in data) {
                    if(data.hasOwnProperty(n)) {
                        var note = data[n];
                        // Create note item wrap 
                        var temp = $(noteItemTemplate);
                        var time, title;
                        for(key in note) {
                            if(note.hasOwnProperty(key)) {
                                var value = note[key];
                                // Inflate wrap with details
                                switch (key) {
                                    case 'title':
                                        title = value;
                                        temp.find('.note-item-title').html(value);
                                        setRandomBlue(temp.find('.note-item-title'));
                                        break;
                                    case 'timeCreated':
                                        time = value;
                                        temp.find('.note-item-time').html(moment(parseInt(value, 10)).format('llll'));
                                        break;
                                    case 'note':
                                        value = value.replace(/(?:\r\n|\r|\n)/g, '<br />');
                                        temp.find('.note-item-note').append(value);
                                        break;
                                    case 'imageUrl':
                                        if (value != "") {
                                            temp.append('<a class="light-box-link" href="' + value + '"><div class="note-item-image"></div></a>');
                                            temp.find('.note-item-image').css('background-image', 'url("' + value + '")');
                                        }
                                        break;
                                    default:
                                        // console.log(key + ': ' + value);
                                }
                            }
                        }
                        // Initialize Light Box
                        temp.find('.light-box-link').attr('data-title', title);
                        temp.find('.light-box-link').attr('data-lightbox', time);
                        // Prepend to notes wrap
                        $('#notes-wrap').prepend(temp);
                    }
                }
                $('#notes-section .spinner').fadeOut();
            });
        }

        if ($('#gallery-wrap').html() == '') {
            firebase.database().ref(user.uid + '/gallery').once('value', function(snapshot) {
                var data = snapshot.val();
                for (i in data) {
                    if(data.hasOwnProperty(i)) {
                        var image = data[i];
                        // Create image item wrap 
                        var temp = $(imageItemTemplate);
                        var title, time;
                        for(key in image) {
                            if(image.hasOwnProperty(key)) {
                                var value = image[key];
                                // Inflate wrap with details
                                switch (key) {
                                    case 'title':
                                        title = value;
                                        temp.find('.image-item-title').html(value);
                                        break;
                                    case 'imageUrl':
                                        if (value != "") {
                                            temp.attr('href', value);
                                            temp.find('img').attr('src', value);
                                        }
                                        break;
                                    case 'timeCreated':
                                        time = moment(parseInt(value, 10)).format('ll');
                                        break;
                                    default:
                                        // console.log(key + ': ' + value);
                                }
                            }
                        }
                        temp.attr('data-title', title + ' (' + time + ')');
                        // Prepend to gallery wrap
                        $('#gallery-wrap').prepend(temp);
                    }
                }
                $('#gallery-section .spinner').fadeOut();
            });
        }
    }

    $('#attached-photo').change(function(){
        var file = document.getElementById('attached-photo').files[0];
        if (file && file.type.match(/image.*/)) {
            // Change label to name
            var fileName = $(this).val().split('\\').pop();
            if (fileName) {
                $('#attach-btn span').text(fileName.length >= 20 ? (fileName.substring(0, 17) + "...") : fileName);
                $('.text-input-area, #create-area').addClass('pushed');
                loadFile($('#img-preview'), file);
                $('#img-preview').fadeIn();
            }
        }  else {
            resetFileInput();
        }
    });

    /* CREATE */

    $('#save-btn').click(function(){
        // Validate Fields
        if ($('#create-note-title').val().length != 0) {
            // Set btn to loading state
            $('#save-btn i').attr('class', 'fa fa-fw fa-spinner fa-spin');
            create($('#create-note-title').val(), $('#create-note-pad').val(), $('#img-preview'));
        } else {
            showAlert('error', 'exclamation', 'Title?');
        }
    });

    function create(title, note, img){
        // Use user's uid as directory
        // Together with security rules on Firebase's side to ensure privacy
        var user = firebase.auth().currentUser;
        var uid;
        if (user) uid = user.uid;
        var userStorageRef = firebase.storage().ref().child(uid);
        var userDatabaseRef = firebase.database().ref().child(uid);

        // Use current millisecond as unique name for photo/note
        var d = new Date();
        var t = d.getTime();

        // Get a key for a new note (shared by note and gallery entry)
        var key = userDatabaseRef.child('notes').push().key;

        // Initialize updates var
        var updates = {};

        if (img.css('background-image') != 'none') {
            // Set btn to loading state
            $('#save-btn').attr('class', 'progress-btn state-loading');

            // Get resized user selected photo's base64 string
            var picStr = resizeImgToFile(img);

            // Filter invalid chars
            var str = picStr.substring(picStr.indexOf(',') + 1);

            // Get metadata ready for Firebase upload
            var metadata = {contentType: 'image/png'};

            // Use milli as photo file name
            var fileName = t + '.png';
            var picRef = userStorageRef.child('gallery/' + fileName);

            // Upload to Firebase Storage
            // Take advantage of Firebase uploadTask to monitor progress/errors
            var task = picRef.putString(str, 'base64', metadata);

            // uploadTask
            task.on(firebase.storage.TaskEvent.STATE_CHANGED,
                function(snapshot) {
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    // Set Progress Btn's width
                    setProgress(progress);
                },
                function(error) {
                    // Error alert!
                    resetProgressBtn('error');
                    showAlert('error', 'exclamation', 'Error');
                }, 
                function() {
                    // Upload completed successfully, now we can get the download URL
                    var downloadURL = task.snapshot.downloadURL;

                    // Save To Both (updates bundle)
                    saveToNote(title, note, t, downloadURL, uid, key, updates);
                    saveToGallery(title, downloadURL, t, uid, key, updates);
                    userDatabaseRef.update(updates, function(error) {
                        if (error) showAlert('error', 'exclamation', 'Error');
                        else {
                            // Success alert!
                            resetProgressBtn('success');
                            showAlert('success', 'check', 'Success');
                            resetFields();
                        }
                    });
            });
        } else {
            // Only Save To Note
            saveToNote(title, note, t, '', uid, key, updates);
            userDatabaseRef.update(updates, function(error) {
                if (error) showAlert('error', 'exclamation', 'Error');
                else {
                    // Success alert!
                    resetProgressBtn('success');
                    showAlert('success', 'check', 'Success');
                    resetFields();
                }
            });
        }
    }

    function saveToNote(title, note, time, imageUrl, uid, key, updates) {
        var noteData = {
            title: title,
            note: note,
            timeCreated: time,
            timeLastUpdated: time,
            imageUrl: imageUrl,
            uid: uid
        };
        updates['/notes/' + key] = noteData;
    }

    function saveToGallery(title, imageUrl, time, uid, key, updates) {
        var picData = {
            title: title,
            imageUrl: imageUrl,
            timeCreated: time,
            timeLastUpdated: time,
            uid: uid
        };
        updates['/gallery/' + key] = picData;
    }

    function showAlert(result, icon, msg) {
        $('#create-alert').attr('class', 'alert result-' + result);
        $('#create-alert i').attr('class', 'fa fa-fw fa-' + icon + '-circle');
        $('#create-alert span').text(msg);
        $('#create-alert').fadeIn().delay(1500).fadeOut();
    }

    function resetProgressBtn(state) {
        $('#save-btn').attr('class', 'progress-btn state-' + state)
                      .delay(1500)
                      .queue(function(next) {
                          $('#save-btn i').attr('class', 'fa fa-fw fa-floppy-o');
                          $(this).removeClass('state-' + state);
                          next();
                      });
        setProgress(0);
    }

    function resetFields() {
        $('#create-note-title').val('');
        $('#create-note-pad').val('');
        resetFileInput();
        setTimeout(function(){window.location.reload()}, 2000);
    }

    function resetFileInput() {
        $('#attached-photo').wrap('<form>').closest('form').get(0).reset();
        $('#attached-photo').unwrap();
        $('#attach-btn span').text('Attach a Photo');
        $('.text-input-area, #create-area').removeClass('pushed');
        $('#img-preview').fadeOut();
        $('#img-preview').css('background-image', 'none');
    }

    function setProgress(progress) {
        $('#save-btn .progress-inner').css('width', progress + '%');
    }

    function loadFile(img, file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            img.data('src', e.target.result);
            img.css('background-image', 'url(' + e.target.result + ')');
        }
        reader.readAsDataURL(file);
    }

    function resizeImgToFile(img) {
        var canvas = document.createElement("canvas");
        var i = document.createElement("img");
        i.src = img.data('src');

        var MAX_WIDTH = 700;
        var MAX_HEIGHT = 700;
        var width = i.width;
        var height = i.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(i, 0, 0, width, height);

        return canvas.toDataURL("image/png");
    }

    function setRandomBlue(target) {
        var h, s, l, color;
        h = 210;
        s = Math.floor(Math.random() * 100);
        if (s < 30) s += 30;
        if (s > 70) s -= 30;
        l = Math.floor(Math.random() * 100);
        if (l < 30) l += 30;
        if (l > 70) l -= 30;
        color = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
        target.css('background-color', color);
    }
    
    /* Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    // Credit: David Walsh
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
    var monitorScroll = debounce(function() {
        if ($('#content-wrap').scrollTop() > 120) {
            $('.menu-btn').addClass("fixed");
        } else {
            $('.menu-btn').removeClass("fixed");
        }
        if ($('#content-wrap').scrollTop() > 136) {
            $('.nav-menu').addClass("fixed");
        } else {
            $('.nav-menu').removeClass("fixed");
        }
    }, 50);
    $('#content-wrap').scroll(monitorScroll); */
    
});