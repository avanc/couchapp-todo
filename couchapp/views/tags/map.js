function(doc) {
    if (doc.type == "todo") {
        if (typeof(doc.tags) !== "undefined") {
            for (var i=0; i<doc.tags.length; i++) {
                emit(doc.tags[i], 1);
            }
        }
    }
}
