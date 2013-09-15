// Description:	Generates the booklet HTML based on the booklet name and language
// 				code provided by the anchor name attribute and stores in DOM

// $(document).ready(function(){

//	checkUrl();

	// Call loadBooklet function on click
//	$("a.loadBookletLink").bind("click", loadBooklet);
	  
// });

// Function:	checkUrl
// Description:	Checks if a hash exists in the URL & redirects if necessary. This is
//				used to prevent the app from breaking when the page is refreshed.

function checkUrl() {
	var currentLocation = window.location.href;
	var currentHash = window.location.hash.split("#");
	if (currentHash[1]) {
		if (currentHash[1].split("_")[3]) {
			var desiredBook = currentHash[1].split("_")[0];
			var desiredLang = currentHash[1].split("_")[1];
			var desiredLangMod = currentHash[1].split("_")[2]
			var desiredPage = currentHash[1].split("_")[3];
			if (desiredPage) {
				var desiredPath = window.location.pathname.split("/");
				window.location.href = desiredPath[0] + "booklet.html?book=" + desiredBook + "&lang=" + desiredLang + "_" + desiredLangMod + "#" + desiredBook + "_" + desiredLang + "_" + desiredLangMod + "_" + desiredPage;
			}
		}
		else {
			var desiredBook = currentHash[1].split("_")[0];
			var desiredLang = currentHash[1].split("_")[1];
			var desiredPage = currentHash[1].split("_")[2];
			if (desiredPage) {
				var desiredPath = window.location.pathname.split("/");
				window.location.href = desiredPath[0] + "booklet.html?book=" + desiredBook + "&lang=" + desiredLang + "#" + desiredBook + "_" + desiredLang + "_" + desiredPage;
			}
		}
	}
}

// Function:	loadBooklet
// Description:	Loads selected booklet into DOM and navigates to first page

function displayJson(booklet, langCode) {
	var bookletJson = new Object();
	
	// Assign booklet Id and booklet path
	var bookId = booklet + "_" + langCode;
	var bookIdPath = booklet + "/" + langCode;
		
	// Define paths to XML file and package (local server)
	var bookXml = "assets/localRepo/Packages/" + bookIdPath + ".xml";
	var bookPath = "assets/localRepo/Packages/" + bookIdPath + "/";
	var sharePath = "assets/localRepo/Packages/shared/";
	
	// Call functions to get booklet HTML
	getList(bookXml);
	var bookContent = getBooklet(booklet, bookId, bookPath, sharePath, bookPages);
	
	for (var i = 0; i < bookContentList.length; i++) {
		bookletJson['"' + 'page' + i + '"'] = (bookContentList[i]).replace(/"/g, '\\"');
	}
	
	return bookletJson;	
}

// Function:	loadBooklet
// Description:	Loads selected booklet into DOM and navigates to first page

function loadBooklet(event) {
	
	$.mobile.showPageLoadingMsg();
	
	// Extract the booklet and language code from anchor name attribute
	var params = $(this).attr("name").split("_");
	var booklet = params[0];
	var langCode = params[1];
	
	// Check if language clarifier (i.e. en_US) exists
	if(params[2]) {
	
		// Assign booklet Id and booklet path
		var langCodeMod = params[2];
		var langCode = langCode + "_" + langCodeMod;
	
	}
		
	setTimeout(function() {
		
		// Assign booklet Id and booklet path
		var bookId = booklet + "_" + langCode;
		var bookIdPath = booklet + "/" + langCode;
		
		// Check if booklet is already loaded in DOM
		if(document.getElementById(bookId + "_0")) {
			
			// Redirect to first page of booklet
			$.mobile.changePage("#" + bookId + "_0", { showLoadMsg: true });
					
		}
		else {
			
			// Define paths to XML file and package (local server)
			var bookXml = "assets/localRepo/Packages/" + bookIdPath + ".xml";
			var bookPath = "assets/localRepo/Packages/" + bookIdPath + "/";
			var sharePath = "assets/localRepo/Packages/shared/";
			
			// Call functions to get booklet HTML
			getList(bookXml);
			var bookContent = getBooklet(booklet, bookId, bookPath, sharePath, bookPages);
			// var aboutContent = getPage(booklet, bookId, bookPath, aboutPage);
			
			// Define the booklet content variable
			// var bookletContent = bookContent + aboutContent;
			var bookletContent = bookContent;
			
			// Populate body with booklet content HTML
			$("body").append(bookletContent);
			
			// Redirect to first page of booklet
			$.mobile.changePage("#" + bookId + "_0", { showLoadMsg: true });
			
		}
		
	}, 1000);
	
}

// Function:	getList
// Description:	Gets a listing of pages for the selected booklet
// 				Parses the XML file and outputs bookPages array

function getList(fileUrl) {
	
	var i = 0; // Variable i for iteration
	bookPages = new Array(); // Empty bookPages array
	
	// Perform AJAX GET request and parse through config XML file
	$.ajax( {
	
		async: false,
		type: "GET",
		url: fileUrl,
		dataType: "xml",
		success: function(xml) {

			// Iterate through each page node and populate arrays
			$(xml).find("page").each(function() {

				bookPages[i] = $(this).attr("filename");
				i = i + 1;
			
			});
			
		},
		error: function(error, errorText) {
			window.location = "error.html";
		}
		
	});
	
}

// Function: 	getBooklet
// Description:	Loops through each page of selected booklet and returns each page
// 				Uses the getPage function

function getBooklet(booklet, bookId, path, sharePath, book) {

	var bookContent = ""; // Initialize book content variable
	var bookLength = book.length; // Length of booklet array
	bookContentList = new Array(); // Initialize book content array
	
	// Iterate through booklet array to parse each page
	for(i = 0; i < bookLength; i++) {
		getPage(booklet, bookId, path, sharePath, book[i], i);
	}
	
	// Populate book content variable
	for(i = 0; i < bookContentList.length; i++) {
		bookContent = bookContent + bookContentList[i];
	}
	
	// Return book content HTML
	return bookContent;
	
}

// Function:	getPage
// Description:	Parses through a booklet page XML file

function getPage(booklet, bookId, path, sharePath, page, i) {

	var pagePath = path + page; // Define the file url
	var sharePath = sharePath; // Define the shared images path
	var currentPage = page; // Define current page
	var firstPage = bookPages[0]; // Define first page
	var firstPageNumber = 0; // Define first page number
	var lastPage = bookPages[bookPages.length - 1]; // Define last page
	var lastPageNumber = bookPages.length - 1; // Define last page number

	// Construct anchors link
	var prevPage = i - 1; // Backtrack page number
	var nextPage = i + 1; // Iterate page number
	
// 	var homeAnchor = "<li><a href='index.html/#home' data-role='button' data-icon='home' data-direction='reverse'>Home</a></li>";
// 	
// 	if (prevPage < 0) {
// 		var backPageAnchor = "<li><a class='prev_page' name='" + bookId + "_prev' href='#" + booklet + "_repo' data-role='button' data-icon='arrow-l' data-direction='reverse'>Back</a></li>";
// 	}
// 	else {
// 		var backPageAnchor = "<li><a class='prev_page' name='" + bookId + "_prev' href='#" + bookId + "_" + prevPage + "' data-role='button' data-icon='arrow-l' data-direction='reverse'>Back</a></li>";
// 	}
// 	
// 	var nextPageAnchor = "<li><a class='next_page' name='" + bookId + "_next' href='#" + bookId + "_" + nextPage + "' data-role='button' data-icon='arrow-r'>Next</a></li>";
// 	
// 	if (currentPage === lastPage){
// 	
// 		// Construct footer
// 		var footer = "<div data-role='footer' data-position='fixed'><div data-role='navbar'><ul>" + backPageAnchor + homeAnchor + "</ul></div>";
// 		
// 	}
// 	else {
// 	
// 		// Construct footer
// 		var footer = "<div data-role='footer' data-position='fixed'><div data-role='navbar'><ul>" + backPageAnchor + homeAnchor + nextPageAnchor + "</ul></div>";
// 	
// 	}
	
	var homeAnchor = "<li><a href='#' class='homePage' id='home_" + bookId + "_" + i + "' data-role='button' data-icon='home' data-direction='reverse'>Home</a></li>";
	var backPageAnchor = "<li><a class='prevPage' id='prev_" + bookId + "_" + i + "' data-role='button' data-icon='arrow-l' data-direction='reverse'>Back</a></li>";
	var nextPageAnchor = "<li><a class='nextPage' id='next_" + bookId + "_" + i + "' data-role='button' data-icon='arrow-r'>Next</a></li>";
	
	if (currentPage === lastPage){
	
		// Construct footer
		var footer = "<div data-role='footer' data-position='fixed'><div data-role='navbar'><ul>" + backPageAnchor + homeAnchor + "</ul></div>";
		
	}
	else {
	
		// Construct footer
		var footer = "<div data-role='footer' data-position='fixed'><div data-role='navbar'><ul>" + backPageAnchor + homeAnchor + nextPageAnchor + "</ul></div>";
	
	}
	
	// Initial variable definition
	var imgElementStyle = "";
	
	var pageColor = "";					// Page background color
	var pageBackground = "";			// Page background image
	var pageWatermark = "";				// Page background watermark
	
	var titleMode = "";					// Title mode
	var titleHeadingSize = "";			// Title heading text size
	var titleHeading = "";				// Title heading text
	var titleHeadingAlign = "";			// Title heading text align
	var titleHeadingAlignClass = "";	// Title heading text align class
	var titleHeadingColor = "";			// Title heading color
	var titleNumberSize = "";			// Title number text size
	var titleNumber = "";				// Title number text
	var titlePeekpanel = "";			// Peekpanel text
	var titlePeekpanelSize = "";		// Peekpanel text size
	var titlePeekpanelAlign = "";		// Peekpanel text align
	var titlePeekpanelAlignClass = "";	// Peekpanel text align class
	var titleSubheadingSize = "";		// Title subheading text size
	var titleSubheading = "";			// Title subheading text
	var titleSubheadingAlign = "";		// Title subheading text align
	var titleSubheadingAlignClass = "";	// Title subheading text align class
	var titleSubheadingColor = "";		// Title subheading color
	
	var buttonMode = "";				// Button mode
	var buttonLabel = "";				// Button label
	var buttonLabelSize = "";			// Button label size
	var buttonUrl = "";					// Button URL
	var buttonUrlNum = "";				// Button URL number
	var buttonFirstChild = "";			// Button first child
	var buttonText = "";				// Button text
	var buttonTextSize = "";			// Button text size
	var buttonImage = "";				// Button image
	var buttonImageAlign = "";			// Button image align
	var buttonImageWidth = "";			// Button image width
	var buttonImageHeight = "";			// Button image height
	
	var panelButtonMode = "";			// Panel button mode
	var panelButtonSize = "";			// Panel button size
	var panelButtonText = "";			// Panel button text
	var panelImage = "";				// Panel image
	var panelImageAlign = "";			// Panel image align
	var panelImageWidth = "";			// Panel image width
	var panelImageHeight = "";			// Panel image height
	var panelTextModifier = "";			// Panel text modifier
	var panelTextSize = "";				// Panel text size
	var panelText = "";					// Panel text
	var panelTextAlign = "";			// Panel text align	
	var panelTextAlignClass = "";		// Panel text align	class
	
	var textModifer = "";				// Text modifer
	var textModiferClass = "";			// Text modifer class
	var textAlign = "";					// Text align
	var textAlignClass = "";			// Text align class
	var textAlpha = "";					// Text alpha
	var textSize = "";					// Text size
	var textText = "";					// Text content
	var textColor = "";					// Text color
	
	var imageText = "";					// Image text
	var imageWidth = "";				// Image width
	var imageHeight = "";				// Image height
	var imageAlign = "";				// Image align
	
	var questionMode = "";				// Question mode
	var questionText = "";				// Question text
	var questionTextSize = "";			// Question text size
	
 	$.ajax({
		
		async: false,
		type: "GET",
		url: pagePath,
		dataType: "xml",
		success: function(xml) {
			
			// Define page node attributes
			pageColor = $(xml).find("page").attr("color");
			pageBackground = $(xml).find("page").attr("backgroundimage"); 
			pageWatermark = $(xml).find("page").attr("watermark");
			
			// Construct page style (Apply background images if window < 320 pixels)
// 			if (window.innerWidth > 320) {
// 				pageStyle = "style='background: " + pageColor + ";'";
// 			}
//			else {
				if (pageBackground && pageWatermark){
					pageStyle = "style=\"background-color: " + pageColor + "; background-image: url('" + path + "images/" + pageBackground + "'), url('" + path + "images/" + pageWatermark + "'); background-position: center top; background-repeat: no-repeat;\"";
				}
				else if (pageBackground && pageWatermark == undefined){
					pageStyle = "style=\"background-color: " + pageColor + "; background-image: url('" + path + "images/" + pageBackground + "'); background-position: center top; background-repeat: no-repeat;\"";
				}
				else if (pageBackground == undefined && pageWatermark){
					pageStyle = "style=\"background-color: " + pageColor + "; background-image: url('" + path + "images/" + pageWatermark + "'); background-position: center top; background-repeat: no-repeat;\"";
				}
				else {
					pageStyle = "style=\"background: " + pageColor + ";\"";
				}
//			}
			
			// Construct font style
			fontStyle = "style='color: " + pageColor + ";'";
			
			// Construct page div opening tag
			pageOpen = "<div data-role='page' data-theme='a' id='" + bookId + "_" + i + "' " + pageStyle + ">";
			
			pageContentOpen = "<div data-role='content'>";
			
			pageContent = "";
			
			$(xml).find("page").children().each(function(index, value) {
				
				if (this.nodeName == "title") {
				
					titleMode = $(this).attr("mode");
					
					if (titleMode == "clear") {
					
						pageContent = "<div class='contentTitleClear' id='contentTitle_" + bookId + "_" + i + "'>";
						
						$(this).children().each(function() {
							if (this.nodeName == "heading") {
								titleHeadingSize = $(this).attr("size");
								if (titleHeadingSize) {
									titleHeadingSize = Math.round((titleHeadingSize/100)*17);
								}
								titleHeadingAlign = $(this).attr("textalign");
								titleHeadingAlignClass = getAlignClass(titleHeadingAlign);
								titleHeadingColor = $(this).attr("color");
								if (titleHeadingColor === undefined || titleHeadingColor === "") {
									titleHeadingColor = pageColor;
								}
								titleHeading = $(this).text().replace(/\n/g, "<br />");
								
								if (titleHeadingSize) {
									pageContent = pageContent + "<div class='titleHeadingClear " + titleHeadingAlignClass + "' style='color: " + titleHeadingColor + "; font-size: " + titleHeadingSize + "px;'>" + titleHeading + "</div>";
								}
								else {
									pageContent = pageContent + "<div class='titleHeadingClear " + titleHeadingAlignClass + "' style='color: " + titleHeadingColor + ";'>" + titleHeading + "</div>";									
								}
							}
							else if (this.nodeName == "subheading") {
								titleSubheadingSize = $(this).attr("size");
								if (titleSubheadingSize) {
									titleSubheadingSize = Math.round((titleSubheadingSize/100)*17);
								}
								titleSubheadingAlign = $(this).attr("textalign");
								titleSubheadingAlignClass = getAlignClass(titleSubheadingAlign);	
								titleSubheadingColor = $(this).attr("color");
								if (titleSubheadingColor === undefined || titleSubheadingColor === "") {
									titleSubheadingColor = pageColor;
								}
								titleSubheading = $(this).text().replace(/\n/g, "<br />");
								
								if (titleSubheadingSize) {
									pageContent = pageContent + "<div class='titleSubheadingClear " + titleSubheadingAlignClass + "' style='color: " + titleSubheadingColor + "; font-size: " + titleSubheadingSize + "px;'>" + titleSubheading + "</div>";
								}
								else {
									pageContent = pageContent + "<div class='titleSubheadingClear " + titleSubheadingAlignClass + "' style='color: " + titleSubheadingColor + ";'>" + titleSubheading + "</div>";									
								}
							}
						})
						
						pageContent = pageContent + "</div>";
					
					}
					else if (titleMode == "peek") {
					
						pageContent = "<div class='contentTitlePeek' id='contentTitle_" + bookId + "_" + i + "'>";
						
						$(this).children().each(function() {
							if (this.nodeName == "number") {
								titleNumberSize = $(this).attr("size");
								if (titleNumberSize) {
									titleNumberSize = Math.round((titleNumberSize/100)*68);								titleNumber = $(this).text().replace(/\n/g, "<br />");
								}
								
								if (titleNumberSize) {
									pageContent = pageContent + "<div class='titleNumberPeek' style='color: " + pageColor + "; font-size: " + titleNumberSize + "px;'>" + titleNumber + "</div>";
								}
								else {
									pageContent = pageContent + "<div class='titleNumberPeek'" + fontStyle + ">" + titleNumber + "</div>";
								}
							}
							else if (this.nodeName == "heading") {
								titleHeadingSize = $(this).attr("size");
								if (titleHeadingSize) {
									titleHeadingSize = Math.round((titleHeadingSize/100)*30);
								}
								titleHeadingAlign = $(this).attr("textalign");
								titleHeadingAlignClass = getAlignClass(titleHeadingAlign);								
								titleHeading = $(this).text().replace(/\n/g, "<br />");
								
								if (titleHeadingSize) {
									pageContent = pageContent + "<div class='titleHeadingPeek " + titleHeadingAlignClass + "' style='color: " + pageColor + "; font-size: " + titleHeadingSize + "px;'>" + titleHeading + "</div>";
								}
								else {
									pageContent = pageContent + "<div class='titleHeadingPeek " + titleHeadingAlignClass + "'" + fontStyle + ">" + titleHeading + "</div>";
								}
							}
							else if (this.nodeName == "subheading") {
								titleSubheadingSize = $(this).attr("size");
								if (titleSubheadingSize) {
									titleSubheadingSize = Math.round((titleSubheadingSize/100)*17);
								}
								titleSubheadingAlign = $(this).attr("textalign");
								titleSubheadingAlignClass = getAlignClass(titleSubheadingAlign);								
								titleSubheading = $(this).text().replace(/\n/g, "<br />");
								
								if (titleSubheadingSize) {
									pageContent = pageContent + "<div class='titleSubheadingPeek " + titleSubheadingAlignClass + "' style='color: " + pageColor + "; font-size: " + titleSubheadingSize + "px;'>" + titleSubheading + "</div>";
								}
								else {
									pageContent = pageContent + "<div class='titleSubheadingPeek " + titleSubheadingAlignClass + "'" + fontStyle + ">" + titleSubheading + "</div>";
								}
							}
							else if (this.nodeName == "peekpanel") {
								titlePeekpanelSize = $(this).attr("size");
								if (titlePeekpanelSize) {
									titlePeekpanelSize = Math.round((titlePeekpanelSize/100)*17);
								}
								titlePeekpanelAlign = $(this).attr("textalign");
								titlePeekpanelAlignClass = getAlignClass(titlePeekpanelAlign);								
								titlePeekpanel = $(this).text().replace(/\n/g, "<br />");
								
								if (titlePeekpanelSize) {								
									pageContent = pageContent + "<div id='btnPeekpanel" + i + "' class='peekPanelLink'><img src='assets/images/down-arrow-dark.png' /></div><div id='textPeekpanel" + i + "' class='peekPanelContent " + titlePeekpanelAlignClass + "'><p style='color: " + pageColor + "; font-size: " + titlePeekpanelSize + "px;'>" + titlePeekpanel + "</p></div>" + "<script> $(\'#contentTitle_" + bookId + "_" + i + "\').click(function(){$(\'#textPeekpanel" + i + "\').slideToggle('fast');});</script>";
								}
								else {
									pageContent = pageContent + "<div id='btnPeekpanel" + i + "' class='peekPanelLink'><img src='assets/images/down-arrow-dark.png' /></div><div id='textPeekpanel" + i + "' class='peekPanelContent " + titlePeekpanelAlignClass + "'><p " + fontStyle + ">" + titlePeekpanel + "</p></div>" + "<script> $(\'#contentTitle_" + bookId + "_" + i + "\').click(function(){$(\'#textPeekpanel" + i + "\').slideToggle('fast');});</script>";
								}
							}
						})
						
						pageContent = pageContent + "</div>";
					
					}
					else if (titleMode == "straight") {
					
						pageContent = "<div class='contentTitleStraight' id='contentTitle_" + bookId + "_" + i + "'>";
						
						$(this).children().each(function() {
							if (this.nodeName == "heading") {
								titleHeadingSize = $(this).attr("size");
								if (titleHeadingSize) {
									titleHeadingSize = Math.round((titleHeadingSize/100)*17);
								}
								titleHeadingAlign = $(this).attr("textalign");
								titleHeadingAlignClass = getAlignClass(titleHeadingAlign);								
								titleHeading = $(this).text().replace(/\n/g, "<br />");
								
								if (titleHeadingSize) {							
									pageContent = pageContent + "<div class='titleHeadingStraight " + titleHeadingAlignClass + "' style='color: " + pageColor + "; font-size: " + titleHeadingSize + "px;'>" + titleHeading + "</div>";
								}
								else {
									pageContent = pageContent + "<div class='titleHeadingStraight " + titleHeadingAlignClass + "' " + fontStyle + ">" + titleHeading + "</div>";
								}
							}
							else if (this.nodeName == "subheading") {
								titleSubheadingSize = $(this).attr("size");
								if (titleSubheadingSize) {
									titleSubheadingSize = Math.round((titleSubheadingSize/100)*17);
								}
								titleSubheadingAlign = $(this).attr("textalign");
								titleSubheadingAlignClass = getAlignClass(titleSubheadingAlign);								
								titleSubheading = $(this).text().replace(/\n/g, "<br />");
								
								if (titleSubheadingSize) {
									pageContent = pageContent + "<div class='titleSubheadingStraight " + titleSubheadingAlignClass + "' style='color: " + pageColor + "; font-size: " + titleSubheadingSize + "px;'>" + titleSubheading + "</div>";
								}
								else {
									pageContent = pageContent + "<div class='titleSubheadingStraight " + titleSubheadingAlignClass + "' " + fontStyle + ">" + titleSubheading + "</div>";
								}
							}
						})
						
						pageContent = pageContent + "</div>";
					
					}
					else {
					
						pageContent = "<div class='contentTitle' id='contentTitle_" + bookId + "_" + i + "'>";
						
						$(this).children().each(function() {
							if (this.nodeName == "number") {
								titleNumberSize = $(this).attr("size");
								if (titleNumberSize) {
									titleNumberSize = Math.round((titleNumberSize/100)*68);
									titleNumber = $(this).text().replace(/\n/g, "<br />");
								}
								titleNumber = $(this).text().replace(/\n/g, "<br />");
								
								if (titleNumberSize) {
									pageContent = pageContent + "<div class='titleNumber' style='color: " + pageColor + "; font-size: " + titleNumberSize + "px;'>" + titleNumber + "</div>";
								}
								else {
									pageContent = pageContent + "<div class='titleNumber'" + fontStyle + ">" + titleNumber + "</div>";
								}
							}
							else if (this.nodeName == "heading") {
								titleHeadingSize = $(this).attr("size");
								if (titleHeadingSize) {
									titleHeadingSize = Math.round((titleHeadingSize/100)*17);
								}
								titleHeadingAlign = $(this).attr("textalign");
								titleHeadingAlignClass = getAlignClass(titleHeadingAlign);
								titleHeading = $(this).text().replace(/\n/g, "<br />");
								
								if (titleHeadingSize) {
									pageContent = pageContent + "<div class='titleHeading " + titleHeadingAlignClass + "' style='color: " + pageColor + "; font-size: " + titleHeadingSize + "px;'>" + titleHeading + "</div>";
								}
								else {
									pageContent = pageContent + "<div class='titleHeading " + titleHeadingAlignClass + "'" + fontStyle + ">" + titleHeading + "</div>";
								}
							}
							else if (this.nodeName == "subheading") {
								titleSubheadingSize = $(this).attr("size");
								if (titleSubheadingSize) {
									titleSubheadingSize = Math.round((titleSubheadingSize/100)*17);
								}
								titleSubheadingAlign = $(this).attr("textalign");
								titleSubheadingAlignClass = getAlignClass(titleSubheadingAlign);
								titleSubheading = $(this).text().replace(/\n/g, "<br />");
								
								if (titleSubheadingSize) {
									pageContent = pageContent + "<div class='titleSubheading " + titleSubheadingAlignClass + "' style='color: " + pageColor + "; font-size: " + titleSubheadingSize + "px;'>" + titleSubheading + "</div>";
								}
								else {
									pageContent = pageContent + "<div class='titleSubheading " + titleSubheadingAlignClass + "'" + fontStyle + ">" + titleSubheading + "</div>";
								}
							}
							else if (this.nodeName == "peekpanel") {
								titlePeekpanelSize = $(this).attr("size");
								if (titlePeekpanelSize) {
									titlePeekpanelSize = Math.round((titlePeekpanelSize/100)*17);
								}
								titlePeekpanel = $(this).text().replace(/\n/g, "<br />");
								titlePeekpanelAlign = $(this).attr("textalign");
								titlePeekpanelAlignClass = getAlignClass(titlePeekpanelAlign);
								
								if (titlePeekpanelSize) {								
									pageContent = pageContent + "<div id='btnPeekpanel" + i + "' class='peekPanelLink'><img src='assets/images/down-arrow-dark.png' /></div><div id='textPeekpanel" + i + "' class='peekPanelContent " + titlePeekpanelAlignClass + "'><p style='color: " + pageColor + "; font-size: " + titlePeekpanelSize + "px;'>" + titlePeekpanel + "</p></div>" + "<script> $(\'#contentTitle_" + bookId + "_" + i + "\').click(function(){$(\'#textPeekpanel" + i + "\').slideToggle('fast');});</script>";
								}
								else {
									pageContent = pageContent + "<div id='btnPeekpanel" + i + "' class='peekPanelLink'><img src='assets/images/down-arrow-dark.png' /></div><div id='textPeekpanel" + i + "' class='peekPanelContent " + titlePeekpanelAlignClass + "'><p " + fontStyle + ">" + titlePeekpanel + "</p></div>" + "<script> $(\'#contentTitle_" + bookId + "_" + i + "\').click(function(){$(\'#textPeekpanel" + i + "\').slideToggle('fast');});</script>";
								}
							}
						})
						
						pageContent = pageContent + "</div>";
					}
					
				}
				else if (this.nodeName == "button") {
					
					pageContent = pageContent + "<div class = 'contentButton'>"
					
					buttonMode = $(this).attr("mode");
					
					if (buttonMode == "url") {
						buttonLabelSize = $(this).attr("size");
						if (buttonLabelSize) {
							buttonLabelSize = Math.round((buttonLabelSize/100)*20);
						}
						buttonLabel = $(this).attr("label");
						buttonUrl = $(this).text().replace(/\n/g, "<br />");
						if (buttonLabel) {
							if (buttonLabelSize) {
								pageContent = pageContent + "<a href='http://" + buttonUrl + "' data-role='button' data-theme='c' data-mini='true' style='color: " + pageColor + "; font-size: " + buttonLabelSize + "px;'>" + buttonLabel + "</a>";
							}
							else {
								pageContent = pageContent + "<a href='http://" + buttonUrl + "' data-role='button' data-theme='c' data-mini='true' style='color: " + pageColor + ";'>" + buttonLabel + "</a>";
							}
						}
						else {
							if (buttonLabelSize) {
								pageContent = pageContent + "<a href='http://" + buttonUrl + "' data-role='button' data-theme='c' data-mini='true' style='color: " + pageColor + "; font-size: " + buttonLabelSize + "px;'>" + buttonUrl + "</a>";
							}
							else {
								pageContent = pageContent + "<a href='http://" + buttonUrl + "' data-role='button' data-theme='c' data-mini='true' style='color: " + pageColor + ";'>" + buttonUrl + "</a>";
							}
						}
					}
					else if (buttonMode == "email") {
						buttonLabelSize = $(this).attr("size");
						if (buttonLabelSize) {
							buttonLabelSize = Math.round((buttonLabelSize/100)*20);
						}
						buttonLabel = $(this).attr("label");
						buttonUrl = $(this).text().replace(/\n/g, "<br />");
						if (buttonLabel) {
							if (buttonLabelSize) {
								pageContent = pageContent + "<a href='mailto:" + buttonUrl + "' data-role='button' data-theme='a' data-mini='true' style='color: " + pageColor + "; font-size: " + buttonLabelSize + "px;'>" + buttonLabel + "</a>";
							}
							else {
								pageContent = pageContent + "<a href='mailto:" + buttonUrl + "' data-role='button' data-theme='a' data-mini='true' style='color: " + pageColor + ";>" + buttonLabel + "</a>";
							}
						}
						else {
							if (buttonLabelSize) {
								pageContent = pageContent + "<a href='mailto:" + buttonUrl + "' data-role='button' data-theme='a' data-mini='true' style='color: " + pageColor + "; font-size: " + buttonLabelSize + "px;'>" + buttonUrl + "</a>";
							}
							else {
								pageContent = pageContent + "<a href='mailto:" + buttonUrl + "' data-role='button' data-theme='a' data-mini='true' style='color: " + pageColor + ";'>" + buttonUrl + "</a>";
							}
						}
					}
					else if (buttonMode == "phone") {
						buttonLabelSize = $(this).attr("size");
						if (buttonLabelSize) {
							buttonLabelSize = Math.round((buttonLabelSize/100)*20);
						}
						buttonLabel = $(this).attr("label");
						buttonUrl = $(this).text();
						buttonUrlNum = buttonUrl.replace(/[^a-zA-Z 0-9]+/g,'');
						if (buttonLabel) {
							if (buttonLabelSize) {
								pageContent = pageContent + "<a href='#' data-role='button' data-theme='a' data-mini='true' style='color: " + pageColor + "; font-size: " + buttonLabelSize + "px;'>" + buttonLabel + "</a>";
							}
							else {
								pageContent = pageContent + "<a href='#' data-role='button' data-theme='a' data-mini='true' style='color: " + pageColor + ";'>" + buttonLabel + "</a>";
							}
						}
						else {
							if (buttonLabelSize) {
								pageContent = pageContent + "<a href='tel:" + buttonUrlNum + "' data-role='button' data-theme='a' data-mini='true' style='color: " + pageColor + "; font-size: " + buttonLabelSize + "px;'>" + buttonUrl + "</a>";
							}
							else {
								pageContent = pageContent + "<a href='tel:" + buttonUrlNum + "' data-role='button' data-theme='a' data-mini='true' style='color: " + pageColor + ";'>" + buttonUrl + "</a>";
							}
						}
					}
					else if (buttonMode == "allurl") {
						buttonLabelSize = $(this).attr("size");
						if (buttonLabelSize !== undefined) {
							buttonLabelSize = Math.round((buttonLabelSize/100)*20);
						}
						buttonUrl = $(this).text().replace(/\n/g, "<br />");
						// pageContent = pageContent + "<a href='#' data-role='button' data-mini='true'>" + buttonUrl + "</a>";
						// ??? Not for sure how to implement this ???
					}
					else {	
						buttonFirstChild = $(this).children().first().get(0).nodeName;
						
						pageContent = pageContent + "<a class='fancybox' id='anchor_" + bookId + "_" + i + "_child_" + index + "' href='#" + bookId + "_" + i + "_child_" + index + "'><span>";
						
						if (buttonFirstChild == "buttontext") {
						
							buttonText = $(this).find("buttontext").text().replace(/\n/g, "<br />");
							buttonTextSize = $(this).find("buttontext").attr("size");
							if (buttonTextSize) {
								buttonTextSize = Math.round((buttonTextSize/100)*20);
							}
							buttonImage = $(this).find("buttontext").next("image").first().text();
							buttonImageAlign = $(this).find("buttontext").next("image").first().attr("align");
							imgElementStyle = getAlignClass(buttonImageAlign);
							buttonImageWidth = $(this).find("buttontext").next("image").first().attr("w");
							buttonImageHeight = $(this).find("buttontext").next("image").first().attr("h");
							
							if (buttonImage) {
								if (buttonTextSize) {
									if (imgElementStyle === "") {
										pageContent = pageContent + "<p style= 'font-size: " + buttonTextSize + "px;'>" + buttonText + "</p><p>" + "<img src='" + path + "images/" + buttonImage + "' width='" + buttonImageWidth + "' height='" + buttonImageHeight + "'/></p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter textBold'>" + buttonText + "<br />" + "<img src='" + path + "images/" + buttonImage + "' width='" + buttonImageWidth + "' height='" + buttonImageHeight + "'/></p>";
									}
									else {
										pageContent = pageContent + "<p style= 'font-size: " + buttonTextSize + "px;'>" + buttonText + "</p><p class='" + imgElementStyle + "'>" + "<img src='" + path + "images/" + buttonImage + "' width='" + buttonImageWidth + "' height='" + buttonImageHeight + "'/></p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter textBold'>" + buttonText + "<br />" + "<img src='" + path + "images/" + buttonImage + "' width='" + buttonImageWidth + "' height='" + buttonImageHeight + "'/></p>";
									}
								}
								else {
									if (imgElementStyle === "") {
										pageContent = pageContent + "<p>" + buttonText + "</p><p>" + "<img src='" + path + "images/" + buttonImage + "' width='" + buttonImageWidth + "' height='" + buttonImageHeight + "'/></p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter textBold'>" + buttonText + "<br />" + "<img src='" + path + "images/" + buttonImage + "' width='" + buttonImageWidth + "' height='" + buttonImageHeight + "'/></p>";
									}
									else {
										pageContent = pageContent + "<p>" + buttonText + "</p><p class='" + imgElementStyle + "'>" + "<img src='" + path + "images/" + buttonImage + "' width='" + buttonImageWidth + "' height='" + buttonImageHeight + "'/></p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter textBold'>" + buttonText + "<br />" + "<img src='" + path + "images/" + buttonImage + "' width='" + buttonImageWidth + "' height='" + buttonImageHeight + "'/></p>";
									}
								}
							}
							else {
								if (buttonTextSize) {
									pageContent = pageContent + "<p style= 'font-size: " + buttonTextSize + "px;'>" + buttonText + "</p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter textBold'>" + buttonText + "</p>";
								}
								else {
									pageContent = pageContent + "<p>" + buttonText + "</p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter textBold'>" + buttonText + "</p>";
								}
							}
						
							$(this).find("panel").children().each(function() {
								if (this.nodeName == "button") {
									panelButtonMode = $(this).attr("mode");
									panelButtonSize = $(this).attr("size");
									if (panelButtonSize) {
										panelButtonSize = Math.round((panelButtonSize/100)*17);
									}
									panelButtonText = $(this).text().replace(/\n/g, "<br />");
									if (panelButtonSize) {
										if (panelButtonMode == "url") {
											pageContent = pageContent + "<div class='fancybox-link'><p class='aligncenter' style= 'font-size: " + buttonTextSize + "px;'><a style='color: " + pageColor + ";' href='http://" + panelButtonText + "'>" + panelButtonText + "</a></p></div>";
										}
									}
									else {
										if (panelButtonMode == "url") {
											pageContent = pageContent + "<div class='fancybox-link'><p class='aligncenter'><a style='color: " + pageColor + ";' href='http://" + panelButtonText + "'>" + panelButtonText + "</a></p></div>";
										}										
									}
								}
								else if (this.nodeName == "image") {
									panelImage = $(this).text();
									panelImageAlign = $(this).attr("align");
									imgElementStyle = getAlignClass(panelImageAlign);
									panelImageWidth = $(this).attr("w");
									panelImageHeight = $(this).attr("h");
									
									if (panelImage === "line.png") {
									
										pageContent = pageContent + "<p class='lineImage'><img style='width:100%;' src='" + sharePath + panelImage + "' /></p>";	
									
									}
									else {
									
										if (imgElementStyle) {
											pageContent = pageContent + "<p class='" + imgElementStyle + "'><img src='" + path + "images/" + panelImage + "' width='" + panelImageWidth + "' height='" + panelImageHeight + "'/></p>";
										}
										else {
											pageContent = pageContent + "<p><img src='" + path + "images/" + panelImage + "' width='" + panelImageWidth + "' height='" + panelImageHeight + "'/></p>";
										}
									
									}
								}
								else if (this.nodeName == "text") {
									panelTextModifier = $(this).attr("modifier");
									panelTextSize = $(this).attr("size");
									if (panelTextSize) {
										panelTextSize = Math.round((panelTextSize/100)*17);
									}
									panelTextAlign = $(this).attr("textalign");
									panelTextAlignClass = getAlignClass(panelTextAlign);
									panelText = $(this).text().replace(/\n/g, "<br />");
									if (panelTextSize) {
										pageContent = pageContent + "<p class='" + panelTextAlignClass + "' style= 'font-size: " + panelTextSize + "px;'>" + panelText + "</p>";
									}
									else {
										pageContent = pageContent + "<p class='" + panelTextAlignClass + "'>" + panelText + "</p>";
									}
								}
							})
						}
						else if (buttonFirstChild == "image") {
						
							buttonImage = $(this).find("image").first().text();
							buttonImageWidth = $(this).find("image").first().attr("w");
							buttonImageHeight = $(this).find("image").first().attr("h");
							buttonImageAlign = $(this).find("image").first().attr("align");
							imgElementStyle = getAlignClass(buttonImageAlign);
							buttonText = $(this).find("image").next("buttontext").first().text();
							buttonTextSize = $(this).find("image").next("buttontext").first().attr("size");
							if (buttonTextSize) {
								buttonTextSize = Math.round((buttonTextSize/100)*17);
							}
							
							if (buttonText) {
								if (buttonTextSize) {
									if (imgElementStyle) {
										pageContent = pageContent + "<p class='" + imgElementStyle + "'><img src='" + path + "images/" + buttonImage + "' /></p><p class='aligncenter' style= 'font-size: " + buttonTextSize + "px;'>" + buttonText + "</p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter'><img src='" + path + "images/" + buttonImage + "' /><br />" + buttonText + "</p>";
									}
									else {
										pageContent = pageContent + "<p><img src='" + path + "images/" + buttonImage + "' /></p><p class='aligncenter' style= 'font-size: " + buttonTextSize + "px;'>" + buttonText + "</p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter'><img src='" + path + "images/" + buttonImage + "' /><br />" + buttonText + "</p>";
									}
								}
								else {
									if (imgElementStyle) {
										pageContent = pageContent + "<p class='" + imgElementStyle + "'><img src='" + path + "images/" + buttonImage + "' /></p><p class='aligncenter'>" + buttonText + "</p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter'><img src='" + path + "images/" + buttonImage + "' /><br />" + buttonText + "</p>";
									}
									else {
										pageContent = pageContent + "<p><img src='" + path + "images/" + buttonImage + "' /></p><p class='aligncenter'>" + buttonText + "</p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter'><img src='" + path + "images/" + buttonImage + "' /><br />" + buttonText + "</p>";
									}
								}
							}
							else {
								if (imgElementStyle) {
									pageContent = pageContent + "<p class='" + imgElementStyle + "'><img src='" + path + "images/" + buttonImage + "' /></p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter'><img src='" + path + "images/" + buttonImage + "' /></p>";
								}
								else {
									pageContent = pageContent + "<p><img src='" + path + "images/" + buttonImage + "' /></p><script>$(\'#anchor_" + bookId + "_" + i + "_child_" + index + ", #" + bookId + "_" + i + "_child_" + index + "').click(function(){$('#" + bookId + "_" + i + "_child_" + index + "').slideToggle('fast');});</script></span></a><div class='buttonPeekContent' id='" + bookId + "_" + i + "_child_" + index + "' style='display:none;'><p class='aligncenter'><img src='" + path + "images/" + buttonImage + "' /></p>";
								}
							}
							
							$(this).find("panel").children().each(function() {
								if (this.nodeName == "button") {
									panelButtonMode = $(this).attr("mode");
									panelButtonSize = $(this).attr("size");
									if (panelButtonSize) {
										panelButtonSize = Math.round((panelButtonSize/100)*20);
									}
									panelButtonText = $(this).text().replace(/\n/g, "<br />");
									if (panelButtonSize) {
										if (panelButtonMode == "url") {
											pageContent = pageContent + "<div class='fancybox-link'><p class='aligncenter'  style= 'font-size: " + buttonTextSize + "px;'><a style='color: " + pageColor + ";' href='http://" + panelButtonText + "'>" + panelButtonText + "</a></p></div>";
										}
									}
									else {
										if (panelButtonMode == "url") {
											pageContent = pageContent + "<div class='fancybox-link'><p class='aligncenter'><a style='color: " + pageColor + ";' href='http://" + panelButtonText + "'>" + panelButtonText + "</a></p></div>";
										}									
									}
									
								}
								else if (this.nodeName == "image") {
									panelImage = $(this).text();
									panelImageWidth = $(this).attr("w");
									panelImageHeight = $(this).attr("h");
									panelImageAlign = $(this).attr("align");
									imgElementStyle = getAlignClass(panelImageAlign);
									
									if (panelImage === "line.png") {
									
										pageContent = pageContent + "<p class='lineImage'><img style='width:100%;' src='" + sharePath + panelImage + "' /></p>";	
									
									}
									else {
									
										if (imgElementStyle) {
											pageContent = pageContent + "<p class='" + imgElementStyle + "'><img src='" + path + "images/" + panelImage + "' width='" + panelImageWidth + "' height='" + panelImageHeight + "'/></p>";
										}
										else {
											pageContent = pageContent + "<p><img src='" + path + "images/" + panelImage + "' width='" + panelImageWidth + "' height='" + panelImageHeight + "'/></p>";
										}
									
									}
																	
								}
								else if (this.nodeName == "text") {
									
									panelTextModifier = $(this).attr("modifier");
									panelTextSize = $(this).attr("size");
									if (panelTextSize) {
										panelTextSize = Math.round((panelTextSize/100)*17);
									}
									panelTextAlign = $(this).attr("textalign");
									panelTextAlignClass = getAlignClass(panelTextAlign);
									panelText = $(this).text().replace(/\n/g, "<br />");
									if (panelTextSize) {
										pageContent = pageContent + "<p class='" + panelTextAlignClass + "' style= 'font-size: " + panelTextSize + "px;'>" + panelText + "</p>";
									}
									else {
										pageContent = pageContent + "<p class='" + panelTextAlignClass + "'>" + panelText + "</p>";
									}
									
								}
							})
						}
						pageContent = pageContent + "</div>";
					}
					pageContent = pageContent + "</div>";
					
				}
				else if (this.nodeName == "text") {
					
					pageContent = pageContent + "<div class='contentText'>";
					
					textModifier = $(this).attr("modifier");
					textModifierClass = getModifierClass(textModifier);
					
					textAlign = $(this).attr("textalign");
					textAlignClass = getAlignClass(textAlign);
					
					textColor = $(this).attr("color");
					
					textAlpha = $(this).attr("alpha");
					textSize = $(this).attr("size");
					if (textSize !== undefined) {
						textSize = Math.round((textSize/100)*17);
					}
					
					textText = $(this).text().replace(/\n/g, "<br />");
					
					if (textSize) {
						pageContent = pageContent + "<p class='" + textModifierClass + " " + textAlignClass + "' style='color:" + textColor + "; font-size: " + textSize + "px;'>" + textText + "</p>";
					}
					else {
						pageContent = pageContent + "<p class='" + textModifierClass + " " + textAlignClass + "' style='color:" + textColor + ";'>" + textText + "</p>";
					}
					
					pageContent = pageContent + "</div>";
				}
				else if (this.nodeName == "image") {
					
					pageContent = pageContent + "<div class='contentImage'>";
					
					imageText = $(this).text();
					imageWidth = $(this).attr("w");
					imageHeight = $(this).attr("h");
					
					if (imageText === "line.png") {
						
						pageContent = pageContent + "<p class='lineImage'><img style='width:100%;' src='" + sharePath + imageText + "' /></p>";
						
					}
					else {
					
						pageContent = pageContent + "<p><img src='" + path + "images/" + imageText + "' width='" + imageWidth + "' height='" + imageHeight + "'/></p>";
					
					}
					
					pageContent = pageContent + "</div>";
				}
				else if (this.nodeName == "question") {
					
					questionMode = $(this).attr("mode");
					questionTextSize = $(this).attr("size");
					questionText = $(this).text().replace(/\n/g, "<br />");
					
					if (questionMode == "straight") {
						if (questionTextSize) {
							questionTextSize = Math.round((questionTextSize/100)*17);
						}
						if (questionTextSize === undefined) {
							pageContent = pageContent + "<div class='contentQuestionStraight' style='color: " + pageColor + "; font-size: " + questionTextSize + "px;'>";
						}
						else {
							pageContent = pageContent + "<div class='contentQuestionStraight' " + fontStyle + ">";
						}
					}
					else {
						if (questionTextSize) {
							questionTextSize = Math.round((questionTextSize/100)*20);
						}
						if (questionTextSize) {
							pageContent = pageContent + "<div class='contentQuestion' style='font-size: " + questionTextSize + "px;'>";
						}
						else {
							pageContent = pageContent + "<div class='contentQuestion'>";
						}					
					}
					
					pageContent = pageContent + questionText;
					
					pageContent = pageContent + "</div>";
				}
			});
			
			pageContentClose = "</div>";

			pageClose = footer + "</div></div>";
		
			bookContentList[i] = pageOpen + pageContentOpen + pageContent + pageContentClose + pageClose;
			
		} ,
		error: function(error, errorText) {
			window.location = "error.html";
		}
 	});	
}

function getAlignClass(alignVar) {
	if (alignVar == "center") {
		alignVarClass = "aligncenter";
	}
	else if (alignVar == "left") {
		alignVarClass = "alignleft";
	}
	else if (alignVar == "right") {
		alignVarClass = "alignright";
	}
	else {
		alignVarClass = "alignleft";
	}
	return alignVarClass;
}

function getModifierClass(modifierVar) {
	var modifierVarClass = "";
	
	if (modifierVar == "bold"){
		modifierVarClass = "textBold";
	}
	else if (modifierVar == "italics"){
		modifierVarClass = "textItalic";
	}
	else if (modifierVar == "bold-italics"){
		modifierVarClass = "textBoldItalic";
	}
	return modifierVarClass;
}