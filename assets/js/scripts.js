// ----- Booklet functions ----- //

function booklet() {

	var _returnToHome = false;
	var _returnToRepo = false;
	var _currentPage = -1;
	var _targetPage = -1;
	var _book = '';
	var _lang = '';
	var _data = {};
	
	this.setReturnToHome = function(value) {
		_returnToHome = value;
	}
	
	this.isReturnToHome = function() {
		return _returnToHome;
	}
	
	this.setReturnToRepo = function(value) {
		_returnToRepo = value;
	}
	
	this.isReturnToRepo = function() {
		return _returnToRepo;
	}
	
	this.setBook = function(book) {
		_book = book;
	}
	
	this.getBook = function() {
		return _book;
	}
	
	this.setLang = function(lang) {
		_lang = lang;
	}
	
	this.getLang = function() {
		return _lang;
	}
	
	this.setCurrentPage = function(data) {
		_currentPage = data;
	}
	
	this.getCurrentPage = function() {
		return _currentPage;
	}
	
	this.setTargetPage = function(data) {
		_targetPage = data;
	}
	
	this.getTargetPage = function() {
		return _targetPage;
	}
	
	this.setData = function(data) {
		_data = data;
	}
	
	this.getData = function() {
		return _data;
	}
	
	this.loadBooklet = function(book, lang) {
		
		this.setBook(book);
		this.setLang(lang);
	
		var dataUrl = 'assets/json/' + this.getBook() + '/' + this.getBook() + '_' + this.getLang() + '.json';
		var that = this;
	
		$.ajax({
			url: dataUrl,
			type: 'GET',
			dataType: 'json',
			beforeSend: function() {
				$.mobile.showPageLoadingMsg();
			},
			complete: function(data) {
				
				var book = that.getBook();
				var lang = that.getLang();
				var booklet = book + '_' + lang;
				var jsonObject = $.parseJSON(data.responseText);
				
				that.setData(jsonObject);
				that.addHtml(0);
				that.setTargetPage(0);
				
				$.mobile.changePage('#' + book + '_' + lang + '_0');
			}
		});
	
	};
	
	this.switchToNext = function(page) {
		this.setTargetPage(page + 1);
		var book = this.getBook();
		var lang = this.getLang();
		var booklet = book + '_' + lang;
		if (document.getElementById(booklet + '_' + this.getTargetPage())) {
			$.mobile.changePage('#' + booklet + '_' + this.getTargetPage());
		}
		else {
			this.setReturnToHome(true);
			$.mobile.changePage('#home');
		}
	};
	
	this.switchToPrev = function(page) {
		this.setTargetPage(page - 1);
		var book = this.getBook();
		var lang = this.getLang();
		var booklet = book + '_' + lang;
		if (document.getElementById(booklet + '_' + this.getTargetPage())) {
			$.mobile.changePage('#' + booklet + '_' + this.getTargetPage(), {
				reverse: true
			});
		}
		else {
			this.setReturnToRepo(true);
			$.mobile.changePage('#' + book + '_repo', {
				reverse: true
			});
		}
	};
	
	this.switchToHome = function(page) {
		this.setCurrentPage(page);
		this.setReturnToHome(true);
		$.mobile.changePage('#home', {
			reverse: true
		});
	};
	
	this.addHtml = function(page) {
		var pageId = this.getBook() + '_' + this.getLang() + '_' + page;
		var pageArray = this.getData();
		if (pageArray['page' + page]) {
			if (!document.getElementById(pageId)) {
				$('body').append(pageArray['page' + page]);
			}
		}
	}
	
	this.removeHtml = function(page) {
		var pageId = this.getBook() + '_' + this.getLang() + '_' + page;	
		if (document.getElementById(pageId)) {
			$('#' + pageId).remove();
		}
	}
	
	this.onPageChange = function() {
		if (this.isReturnToHome()) {
			this.removeHtml(this.getCurrentPage() - 1);
			this.removeHtml(this.getCurrentPage() + 1);
			this.removeHtml(this.getCurrentPage());
			this.setCurrentPage(-1);
		}
		else if (this.isReturnToRepo()) {
			this.removeHtml(0);
			this.removeHtml(1);
			this.setCurrentPage(-1);
		}
		else if (this.getTargetPage() > this.getCurrentPage()) {
			this.removeHtml(this.getCurrentPage() - 1);
			this.addHtml(this.getCurrentPage() + 2);
			this.setCurrentPage(this.getTargetPage());
		}
		else if (this.getTargetPage() < this.getCurrentPage()) {
			this.removeHtml(this.getCurrentPage() + 1);
			this.addHtml(this.getCurrentPage() - 2);
			this.setCurrentPage(this.getTargetPage());
		}
		this.setTargetPage(-1);
		this.setReturnToHome(false);
		this.setReturnToRepo(false);
	}

}

$(document).ready(function() {

	var bookletStore = new booklet();
	
	$(document).bind('pagechange', $.proxy(bookletStore.onPageChange, bookletStore));
	
	$('.loadBooklet').bind('click', function(event) {
		event.preventDefault();
		var params = $(this).attr('id').split('_');
		var book = params[0];
		var lang = params[1];
		if (params[2]) {
			lang = lang + '_' + params[2];
		}
		bookletStore.loadBooklet(book, lang);
	});
	
	$('.nextPage').live('click', function(event) {
		event.preventDefault();
		var params = $(this).attr('id').split('_');
		var book = params[1];
		var lang = params[2];
		if (params[4]) {
			lang = lang + '_' + params[3];
			var page = parseInt(params[4]);
		}
		else {
			var page = parseInt(params[3]);
		}
		bookletStore.switchToNext(page);
	});
	
	$('.prevPage').live('click', function(event) {
		event.preventDefault();
		var params = $(this).attr('id').split('_');
		var book = params[1];
		var lang = params[2];
		if (params[4]) {
			lang = lang + '_' + params[3];
			var page = parseInt(params[4]);
		}
		else {
			var page = parseInt(params[3]);
		}
		bookletStore.switchToPrev(page);
	});
	
	$('.homePage').live('click', function(event) {
		event.preventDefault();
		var params = $(this).attr('id').split('_');
		var book = params[1];
		var lang = params[2];
		if (params[4]) {
			lang = lang + '_' + params[3];
			var page = parseInt(params[4]);
		}
		else {
			var page = parseInt(params[3]);
		}
		bookletStore.switchToHome(page);
	});

});

// ----- EveryStudent.com functions ----- //

function esData() {

	var _data = {};
	var _category = '';
	var _i = '';
	var _returnToHome = false;
	var _returnToMenu = false;
	var _returnToList = false;
	
	this.setData = function(data) {
		_data = data;
	}
	
	this.getData = function() {
		return _data;
	}
	
	this.setCategory = function(category) {
		_category = category;
	}
	
	this.getCategory = function() {
		return _category;
	}
	
	this.setI = function(i) {
		_i = i;
	}
	
	this.getI = function() {
		return _i;
	}
	
	this.setReturnToHome = function(value) {
		_returnToHome = value;
	}
	
	this.isReturnToHome = function() {
		return _returnToHome;
	}
	
	this.setReturnToMenu = function(value) {
		_returnToMenu = value;
	}
	
	this.isReturnToMenu = function() {
		return _returnToMenu;
	}
	
	this.setReturnToList = function(value) {
		_returnToList = value;
	}
	
	this.isReturnToList = function() {
		return _returnToList;
	}

	this.loadMenu = function() {
	
		var dataUrl = 'assets/xml/EveryStudent.xml';
		var that = this;
		
		$.ajax({
			url: dataUrl,
			type: 'GET',
			dataType: 'xml',
			beforeSend: function() {
				$.mobile.showPageLoadingMsg();
			},
			complete: function(data) {
				var xmlObject = data;				
				that.setData(xmlObject.responseText);
				that.constructMenu();
				$.mobile.changePage('#esMain');
			}
		});
	
	}
	
	this.unloadMenu = function() {
	
		this.setReturnToHome(true);
		$.mobile.changePage('#home', {
			reverse: true
		});
	
	}
	
	this.constructMenu = function() {
	
		var contentHtml = "";
		var data = this.getData();
		var openHtml = "<div data-role=\"page\" data-theme=\"a\" id=\"esMain\"><div data-role=\"header\" data-theme=\"a\"><a href=\"#\" class=\"unloadMenu\" data-role=\"button\" data-icon=\"home\" data-direction=\"reverse\">Home</a><h1>Topics</h1></div><div data-role=\"content\"><ul data-role=\"listview\" data-inset=\"true\" data-theme=\"c\">";
		var closingHtml = "</ul></div></div>";
		$(data).find("category").each(function() {
			contentHtml = contentHtml + "<li><a href=\"#\" class=\"loadList\" id=\"link_" + $(this).attr("id") + "\"><h3>" + $(this).attr("name") + "</h3></a></li>";
		});
		
		this.addHtml(openHtml + contentHtml + closingHtml);
		
	}
	
	this.loadList = function(category) {
		
		this.setCategory(category);
		this.constructList();
		$.mobile.changePage('#list_' + this.getCategory());
		
	}
	
	this.unloadList = function() {
	
		this.setReturnToMenu(true);
		$.mobile.changePage('#esMain', {
			reverse: true
		});
	
	}
	
	this.constructList = function() {

		var contentHtml = "";
		var data = this.getData();
		var category = this.getCategory();
		var openHtml = "<div data-role=\"page\" data-theme=\"a\" id=\"list_" + category + "\"><div data-role=\"header\" data-theme=\"a\"><a href=\"#\" class=\"unloadList\" id=\"return_" + category + "\" data-role=\"button\" data-icon=\"arrow-l\" data-direction=\"reverse\">Topics</a><span class=\"ui-title\" /></div><div data-role=\"content\"><ul data-role=\"listview\" data-inset=\"true\" data-theme=\"c\">";
		var closingHtml = "</ul></div></div>";
		
		$(data).find("category[id='" + category + "']").find("item").each(function(i) {
			contentHtml = contentHtml + "<li><a href=\"#\" class=\"loadArticle\" id=\"" + category + "_" + i + "\"><h3>" + $(this).attr("name") + "</h3><img src=\"assets/images/icons/esarticle.png\" /></a></li>";
		});
		this.addHtml(openHtml + contentHtml + closingHtml);
		
	}
	
	this.loadArticle = function(i) {
	
		this.setI(i);
		
		var category = this.getCategory();
		var i = this.getI();
		
		$.mobile.showPageLoadingMsg();
		this.constructArticle();
		$.mobile.changePage('#' + category + "_article_" + i);
	
	}
	
	this.unloadArticle = function() {
	
		this.setReturnToList(true);
		$.mobile.changePage('#list_' + this.getCategory(), {
			reverse: true
		});
	
	}
	
	this.constructArticle = function() {
	
		var data = this.getData();
		var category = this.getCategory();
		var i = this.getI();
		var title = $(data).find("category[id='" + category + "']").children().eq(i).attr("name");
		var content = $(data).find("category[id='" + category + "']").children().eq(i).text().replace(/\n/g, "<br />");
		
		var contentHtml = "<div data-role=\"page\" data-theme=\"c\" id=\"" + category + "_article_" + i + "\"><div data-role=\"header\" data-theme=\"a\"><a href=\"#\" class=\"unloadArticle\" id=\"back_" + category + "_" + i + "\" data-role=\"button\" data-icon=\"arrow-l\" data-direction=\"reverse\">Back</a><span class=\"ui-title\" /></div><div data-role=\"content\"><h1 class=\"esHeading\">" + title + "</h1><div class=\"esContent\">" + content + "</div></div></div>";
		
		this.addHtml(contentHtml);
	
	}
	
	this.addHtml = function(code) {
		$('body').append(code);
	}
	
	this.removeHtml = function(id) {
		$('#' + id).remove();
	}
	
	this.onPageChange = function() {
		if (this.isReturnToHome()) {
			this.removeHtml('esMain');
		}
		else if (this.isReturnToMenu()) {
			this.removeHtml('list_' + this.getCategory());
		}
		else if (this.isReturnToList()) {
			this.removeHtml(this.getCategory() + '_article_' + this.getI());
		}
		this.setReturnToHome(false);
		this.setReturnToMenu(false);
		this.setReturnToList(false);
	}

}

$(document).ready(function() {

	var esStore = new esData();
	
	$(document).bind('pagechange', $.proxy(esStore.onPageChange, esStore));
	
	$('.loadMenu').bind('click', function(event) {
		event.preventDefault();
		esStore.loadMenu();
	});
	
	$('.unloadMenu').live('click', function(event) {
		event.preventDefault();
		esStore.unloadMenu();
	});
	
	$('.loadList').live('click', function(event) {
		event.preventDefault();
		var category = $(this).attr('id').split('_')[1];
		esStore.loadList(category);
	});	
	
	$('.unloadList').live('click', function(event) {
		event.preventDefault();
		var category = $(this).attr('id').split('_')[1];
		esStore.unloadList(category);
	});
	
	$('.loadArticle').live('click', function(event) {
		event.preventDefault();
		var i = $(this).attr('id').split('_')[1];
		esStore.loadArticle(i);
	});
	
	$('.unloadArticle').live('click', function(event) {
		event.preventDefault();
		var category = $(this).attr('id').split('_')[1];
		var i = $(this).attr('id').split('_')[2];
		esStore.unloadArticle(category,i);
	});

});