import React, { useEffect, useState } from 'react';
import { BuilderComponent, useIsPreviewing } from '@builder.io/react';
import { useParams } from 'react-router-dom';
import builder from '../builder-config';
import '../builder-registry'; // Import registry to ensure components are registered

export default function BuilderPage() {
    const [content, setContent] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const isPreviewing = useIsPreviewing();
    const params = useParams();

    // If using a catch-all route, the path might be in params['*']
    // Otherwise, use window.location.pathname
    const urlPath = window.location.pathname;

    useEffect(() => {
        async function fetchContent() {
            const content = await builder
                .get('page', {
                    url: urlPath,
                })
                .promise();

            setContent(content);
            setNotFound(!content);
        }

        fetchContent();
    }, [urlPath]);

    if (notFound && !isPreviewing) {
        return <div>404 - Page Not Found</div>;
    }

    return (
        <>
            {/* Render the Builder page */}
            <BuilderComponent model="page" content={content} />
        </>
    );
}
