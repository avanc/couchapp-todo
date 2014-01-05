function(doc) {
    if (doc.type == "todo") {
        if ( (typeof(doc.subtype) === "undefined") || doc.subtype=="next" ) {
            if ( (typeof(doc.tags) === "undefined") || doc.tags.length==0 ) {
                emit(["[No Tags]", doc.title], doc);
            }
            else {
                for (var i=0; i<doc.tags.length; i++) {
                    emit([doc.tags[i], doc.title], doc);
                }
            }
        }
    }
};
