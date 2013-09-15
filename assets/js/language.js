function getLanguageName(packageLanguage) {
	// Determine language name based on language code
	if (packageLanguage=="en") {
		packageLanguageName = "English";
	}
	else if (packageLanguage=="en_US") {
		packageLanguageName = "English (United States)";
	}
	else if (packageLanguage=="en_heartbeat") {
		packageLanguageName = "English (Heartbeat Edition)";
	}
	else if (packageLanguage=="et_heartbeat") {
		packageLanguageName = "Estonian (Heartbeat Edition)";
	}
	else if (packageLanguage=="ru") {
		packageLanguageName = "Pусский";
	}
	else if (packageLanguage=="pl") {
		packageLanguageName = "Język polski";
	}
	return packageLanguageName;
}