$(document).ready(function() {
  $('.cop-filters').each(function() {
    var $cf = $(this);
    $(this).find('.filter-menu li').click(function() {
      if(!$(this).hasClass('selected')) {
        var $target = $cf.find('[data-filter-name='+$(this).data('target')+']');

        $(this).addClass('selected').siblings().removeClass('selected');
        $cf.children('.filter-options-wrapper').animate({height:43});
        $target.css({top:-$target.height()}).animate({top:0}, function() {
          $target.addClass('selected')
        });
        $cf.find('.filter-options.selected').animate({top:43}).removeClass('selected');
      } else {
        $(this).removeClass('selected');
        $cf.find('.filter-options.selected').animate({top:-43}).removeClass('selected')
        $cf.children('.filter-options-wrapper').animate({height:0});
      }
    })
    $(this).find('.filter-options li').click(function() {
        var $filter = $cf.find('[data-target='+$(this).parent().data('filter-name')+']');

        $filter.removeClass('selected');
        $cf.find('.filter-options.selected').animate({top:-43}).removeClass('selected')
        $cf.children('.filter-options-wrapper').animate({height:0});
        
        $filter.attr('data-option', $(this).data('option'));
        if($(this).data('option') == '1')
          $filter.html('<span class="option-label">'+$filter.children('.option-label').text()+'</span>');
        else
          $filter.html('<span class="option-label">'+$filter.children('.option-label').text()+'</span> <span class="option">('+$(this).children('.name').text()+')</span>');
    })
  })
});