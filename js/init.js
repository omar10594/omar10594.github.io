/*-----------------------------------------------------------------------------------
/*
/* Init JS
/*
-----------------------------------------------------------------------------------*/

 jQuery(document).ready(function($) {

/*----------------------------------------------------*/
/* FitText Settings
------------------------------------------------------ */

    setTimeout(function() {
	   $('h1.responsive-headline').fitText(1, { minFontSize: '40px', maxFontSize: '90px' });
	 }, 100);


/*----------------------------------------------------*/
/* Smooth Scrolling
------------------------------------------------------ */

   $('.smoothscroll').on('click',function (e) {
	    e.preventDefault();

	    var target = this.hash,
	    $target = $(target);

	    $('html, body').stop().animate({
	        'scrollTop': $target.offset().top
	    }, 800, 'swing', function () {
	        window.location.hash = target;
	    });
	});


/*----------------------------------------------------*/
/* Highlight the current section in the navigation bar
------------------------------------------------------*/

	var sections = $("section");
	var navigation_links = $("#nav-wrap a");

	sections.waypoint({

      handler: function(event, direction) {

		   var active_section;

			active_section = $(this);
			if (direction === "up") active_section = active_section.prev();

			var active_link = $('#nav-wrap a[href="#' + active_section.attr("id") + '"]');

         navigation_links.parent().removeClass("current");
			active_link.parent().addClass("current");

		},
		offset: '35%'

	});


/*----------------------------------------------------*/
/*	Make sure that #header-background-image height is
/* equal to the browser height.
------------------------------------------------------ */

   $('header').css({ 'height': $(window).height() });
   $(window).on('resize', function() {

        $('header').css({ 'height': $(window).height() });
        $('body').css({ 'width': $(window).width() })
   });


/*----------------------------------------------------*/
/*	Fade In/Out Primary Navigation
------------------------------------------------------*/

   $(window).on('scroll', function() {

		var h = $('header').height();
		var y = $(window).scrollTop();
      var nav = $('#nav-wrap');

	   if ( (y > h*.20) && (y < h) && ($(window).outerWidth() > 768 ) ) {
	      nav.fadeOut('fast');
	   }
      else {
         if (y < h*.20) {
            nav.removeClass('opaque').fadeIn('fast');
         }
         else {
            nav.addClass('opaque').fadeIn('fast');
         }
      }

	});

/*----------------------------------------------------*/
/*	contact form
------------------------------------------------------*/

   $('form#contactForm button.submit').click(function() {

      $('#image-loader').fadeIn();

      var contactName = $('#contactForm #contactName').val();
      var contactEmail = $('#contactForm #contactEmail').val();
      var contactSubject = $('#contactForm #contactSubject').val();
      var contactMessage = $('#contactForm #contactMessage').val();

      var data = 'contactName=' + contactName + '&contactEmail=' + contactEmail +
               '&contactSubject=' + contactSubject + '&contactMessage=' + contactMessage;

      $.ajax({

	      type: "POST",
	      url: "inc/sendEmail.php",
	      data: data,
	      success: function(msg) {

            // Message was sent
            if (msg == 'OK') {
               $('#image-loader').fadeOut();
               $('#message-warning').hide();
               $('#contactForm').fadeOut();
               $('#message-success').fadeIn();   
            }
            // There was an error
            else {
               $('#image-loader').fadeOut();
               $('#message-warning').html(msg);
	            $('#message-warning').fadeIn();
            }

	      }

      });
      return false;
   });

   
    /*==================================================================
    [ Focus Contact2 ]*/
    $('.input2').each(function(){
      $(this).on('blur', function(){
         if($(this).val().trim() != "") {
            $(this).addClass('has-val');
         }
         else {
            $(this).removeClass('has-val');
         }
      });
      $(this).on("input",function() {
         if($(this).val().trim() != "") {
            $(this).addClass('has-val');
         }
         else {
            $(this).removeClass('has-val');
         }
      });
      if($(this).val().trim() != "") {
         $(this).addClass('has-val');
      }
      else {
         $(this).removeClass('has-val');
      }
   })
          

  
   /*==================================================================
   [ Validate ]*/
   var name = $('.validate-input input[name="name"]');
   var email = $('.validate-input input[name="email"]');
   var message = $('.validate-input textarea[name="message"]');
   var messageWarning = $('#message-warning');
   var messageSuccess = $('#message-success');
   messageWarning.hide();
   messageSuccess.hide();

   $('.validate-form').on('submit',function(event){
         var check = true;

         if($(name).val().trim() == ''){
            showValidate(name);
            check=false;
         }


         if($(email).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
            showValidate(email);
            check=false;
         }

         if($(message).val().trim() == ''){
            showValidate(message);
            check=false;
         }

         if (check) {
            // get the form data
            // there are many ways to get this data using jQuery (you can use the class or id also)
            var formData = {
               'name'       : $(name).val(),
               'email'      : $(email).val(),
               'message'    : $(message).val()
            };
            // process the form
            $.ajax({
               type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
               url         : 'https://us-central1-serverless-contact-3b082.cloudfunctions.net/api/omar-lopez/', // the url where we want to POST
               data        : formData, // our data object
               dataType    : 'json', // what type of data do we expect back from the server
               encode      : true
            })
               // using the done promise callback
               .done(function(data) {
                  $(name).val('').removeClass('has-val');
                  $(email).val('').removeClass('has-val');
                  $(message).val('').removeClass('has-val');
                  $(messageSuccess).fadeIn(200);
               })
               
               .fail(function (data) {
                  $(messageWarning).fadeIn(200);
               });
         }

         // stop the form from submitting the normal way and refreshing the page
         event.preventDefault();

         return check;
   });


   $('.validate-form .input2').each(function(){
         $(this).focus(function(){
            hideValidate(this);
      });
   });

   function showValidate(input) {
         var thisAlert = $(input).parent();

         $(thisAlert).addClass('alert-validate');
   }

   function hideValidate(input) {
         var thisAlert = $(input).parent();

         $(thisAlert).removeClass('alert-validate');
   }

});








