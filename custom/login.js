$(function(){
    /* Set Input Field Toggle */
    function setFocusedToggle(target) {
        for (t of target) {
            $(t).blur(function() {
                if ($(this).val().length == 0)
                    $(this).parent().removeClass("input-filled");
            }).focus(function() {
                $(this).parent().addClass("input-filled")
            });
        }
    }
    setFocusedToggle($('form .input input'));
    
    /* Show Password */
    $('.show-enabled #input-password').keyup(function(){
        showPassword();
    });
    
    function showPassword() {
        var current = $('.show-enabled #input-password').val();
        if (current != null && current.length != 0)
            $('.show-enabled #password-label').attr('data-content', 'Password: ' + current);
        else
            $('.show-enabled #password-label').attr('data-content', 'Password');
    }
    
    /* Fix Autocomplete Bug
    $('form .input input').on('input', function(){
        $(this).parent().addClass('input-filled');
    }).trigger('focus'); */
    
    $.fn.textWidth = function(){
      var html_calc = $('<span>' + $(this).html() + '</span>');
      html_calc.css('font-size',$(this).css('font-size')).hide();
      html_calc.prependTo('body');
      var width = html_calc.width();
      html_calc.remove();
      return width;
    }
    
    $('#register-section-btn').click(function(){
        if (!$('#register-btn').is(":visible")) {
            $('#input-password').parent().removeClass('show-enabled');
            $('#password-label').attr('data-content', 'Password');
            
            $('#register-section-btn').addClass('current');
            $('#login-section-btn').removeClass('current');
            
            $('.login').hide();
            $('.register').fadeIn();

            $('.go-left').each(function(){
                goDirection($(this));
            });
            
            $('.go-right').each(function(){
                $(this).css('right', 0);
                goDirection($(this));
            });

            $('.right-aligned-prep').addClass('right-aligned');
            $('.left-aligned-prep').addClass('left-aligned');
        }
    });
    
    $('#login-section-btn').click(function(){
        if (!$('#login-btn').is(":visible")) {
            $('#input-password').parent().addClass('show-enabled');
            showPassword();
            
            $('#login-section-btn').addClass('current');
            $('#register-section-btn').removeClass('current');
            
            $('.register').hide();
            $('.login').fadeIn();

            $('.go-left').css('width', '100%');
            $('.go-right').css('width', '100%');

            $('.right-aligned-prep').removeClass('right-aligned');
            $('.left-aligned-prep').removeClass('left-aligned');
        }
    });
    
    function goDirection(target) {
        target.css('width', target.find('span').textWidth() + (target.hasClass('short') ? 40 : 60) + 'px');
    }
    
    /* Login Mechanism */
    var loginErrors = {
        'auth/invalid-email': 'Invalid email!',
        'auth/user-disabled': 'User account has been disabled!',
        'auth/user-not-found': 'User account is not found!',
        'auth/wrong-password': 'Incorrect password!'
    };
    var registerErrors = {
        'auth/email-already-in-use': 'Email already in use!',
        'auth/invalid-email': 'Invalid email!',
        'auth/operation-not-allowed': 'Login mechanism not supported!',
        'auth/weak-password': 'Weak Password (6+ characters)!'
    };
    
    $('#login-btn').click(function(){
        firebase.auth().signInWithEmailAndPassword($('#input-email').val(), $('#input-password').val()).catch(function(error) {
            showWarning(loginErrors[error.code]);
        });
    });
    
    $('#register-btn').click(function(){
        if ($('.input-filled').length != 4) {
            showWarning('Please fill in all the fields!');
        } else if ($('#input-password').val() !== $('#input-confirm').val()) {
            showWarning('Oops! Passwords must match!');
        } else {
            firebase.auth().createUserWithEmailAndPassword($('#input-email').val(), $('#input-password').val()).catch(function(error) {
                showWarning(registerErrors[error.code]);
            });
        }
    });
    
    $("form .input input").keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $('button[type=button]:visible').click();
            return false;
        } else return true;
    });
    
    function showWarning(message) {
        $("#warning-label").text(message);
        $("#warning-label").show( "slide", {direction: "right" }, 400 ).delay(2000).hide( "slide", {direction: "right" }, 400 );
    }
    
    firebase.auth().onAuthStateChanged(function(user) {
        // Handle User here
        if (user) {
            if (user.displayName == null && user.photoURL == null) {
                console.log(user);
                // User is signed in.
                user.updateProfile({
                    displayName: $('#input-name').val(),
                    photoURL: "https://bestnote.dashengz.com/img/placeholder-profile.png"
                }).then(function() {
                    // Update successful.
                    // Save first entry
                    var time = (new Date()).getTime();
                    var userDatabaseRef = firebase.database().ref().child(user.uid);
                    var key = userDatabaseRef.child('notes').push().key;
                    var updates = {};
                    updates['/notes/' + key] = {
                        title: 'Welcome to BestNote',
                        note: '- Feel free to jog down your thoughts, and attach images to capture the moment.\n- All the notes are stored in the cloud, easily accessed by using our web and Android apps.\n- Have fun using BestNote!',
                        time_created: time,
                        time_lastupdated: time,
                        imageurl: 'https://bestnote.dashengz.com/img/ideaicon.png',
                        uid: user.uid
                    };
                    updates['/gallery/' + key] = {
                        title: 'Welcome to BestNote',
                        time_created: time,
                        time_lastupdated: time,
                        imageurl: 'https://bestnote.dashengz.com/img/ideaicon.png',
                        uid: user.uid
                    };
                    userDatabaseRef.update(updates).then(function(){$(location).attr('href', 'main.html');});
                }, function(error) {
                    // An error happened.
                });
            } else {
                $(location).attr('href', 'main.html');
            }
        }
    })
    
});