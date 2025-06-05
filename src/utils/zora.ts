// More robust utility function to sanitize and safely parse JSON
export const safeParseJson = (jsonString: string): any => {
  try {
    // First attempt: Direct parsing
    try {
      return JSON.parse(jsonString);
    } catch (directError) {
      console.log('Direct JSON parsing failed, attempting to fix JSON...');

      // Second attempt: Manual find and replace of the problematic section
      const fixedJson = jsonString.replace(
        /This proposal mints the "([^"]*?)" NFT video/g,
        'This proposal mints the \\"$1\\" NFT video'
      );

      try {
        return JSON.parse(fixedJson);
      } catch (fixError) {
        console.log(
          'JSON fix attempt failed, falling back to manual extraction...'
        );

        // Third attempt: Manual extraction of fields with improved description extraction
        const name =
          jsonString.match(/"name"\s*:\s*"([^"]*)"/)?.[1] || 'Unknown';

        // Extract description more carefully
        let description = '';
        const descMatch = jsonString.match(
          /"description"\s*:\s*"(.*?)(?<!\\)",/
        );
        if (descMatch && descMatch[1]) {
          description = descMatch[1].replace(/\\"/g, '"');
        }

        const image = jsonString.match(/"image"\s*:\s*"([^"]*)"/)?.[1] || '';
        const animation_url = jsonString.match(
          /"animation_url"\s*:\s*"([^"]*)"/
        )?.[1];

        // Extract properties
        let properties = {};
        try {
          const propsMatch = jsonString.match(/"properties"\s*:\s*(\{[^}]*\})/);
          if (propsMatch && propsMatch[1]) {
            const propsJson = propsMatch[1]
              .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3') // Ensure property names are quoted
              .replace(/:\s*'([^']*)'/g, ': "$1"'); // Replace single quotes with double quotes
            properties = JSON.parse(propsJson);
          }
        } catch (e) {
          console.error('Failed to parse properties:', e);
          properties = { number: 1, name: 'Unknown' };
        }

        return {
          name,
          description,
          image,
          animation_url,
          properties,
        };
      }
    }
  } catch (error) {
    console.error('Failed to parse JSON by any method:', error);
  }
  
  // Fallback return when all parsing attempts fail
  return {
    name: 'Unknown Token',
    description: 'No description available',
    image: '',
    animation_url: '',
    properties: { number: 0, name: 'Unknown' },
  };
};