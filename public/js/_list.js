function try_compartir(show, id, boton, ventana){
	if(show){
		$('#'+ventana).show('slow');
		$('#'+id).css('height', '530px');	
		$('#'+boton).hide('slow');
	} else{
		$('#'+ventana).hide('slow');
		$('#'+id).css('height', '480px');	
		$('#'+boton).show('slow');		
	}
}
