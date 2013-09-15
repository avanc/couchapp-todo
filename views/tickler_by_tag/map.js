function(doc) {
    if (doc.type == "todo") {
        if ( doc.subtype=="tickler" ) {
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
