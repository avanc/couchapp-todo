function(doc) {
    if (doc.type == "todo") {
        if (typeof(doc.tags) !== "undefined") {
            emit("", doc);

            for (var i=0; i<doc.tags.length; i++) {
                emit(doc.tags[i], doc);
            }
        }
    }
};
