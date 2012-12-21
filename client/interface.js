$(document).ready(function(){
	$('body').on('click','.give_take .give',function(e){
		e.preventDefault();
		$(this).closest('.front_card').css({
			display: 'none'
		});
		$thisComment = $(this).closest('.front_card').next();
		$thisComment.addClass('animated bounceIn');
		$thisComment.css({
			display: 'block'
		});
		$('.dec',$thisComment).hide();
	});

	$('body').on('click','.give_take .take',function(e){
		e.preventDefault();
		$(this).closest('.front_card').css({
			display: 'none'
		});
		$thisComment = $(this).closest('.front_card').next();
		$thisComment.addClass('animated bounceIn');
		$thisComment.css({
			display: 'block'
		});
		$('.inc',$thisComment).hide();
	});
});