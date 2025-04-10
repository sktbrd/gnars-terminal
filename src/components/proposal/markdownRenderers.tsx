import { Heading } from '@chakra-ui/react';
import React from 'react';

//TODO: May be I can get rid of those types
type MarkdownProps = {
  node?: any;
  alt?: any;
  src?: any;
  title?: string;
};

type RendererProps = MarkdownProps & {
  children?: React.ReactNode;
  ordered?: boolean;
  href?: string;
};
// Define styles for components
const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    margin: '20px 0',
  },
  tr: {
    borderBottom: '1px solid #ddd',
  },
  th: {
    textAlign: 'left' as const,
    backgroundColor: '#f4f4f4',
    padding: '10px',
  },
  td: {
    padding: '10px',
  },
};

// Custom markdown renderers
const MarkdownRenderers = {
  img: ({ src, alt, title }: MarkdownProps) => (
    <img
      src={src}
      alt={alt}
      title={title}
      style={{
        maxWidth: '100%',
        objectFit: 'cover', // Ensure the image fits nicely within the fixed height
        borderRadius: '5px',
        display: 'block',
        margin: '0 auto',
        width: '100%',
      }}
    />
  ),
  table: ({ children, ...props }: RendererProps) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        border: '1px solid none',
        borderRadius: '10px',
        padding: '10px',
        overflowX: 'auto',
      }}
    >
      <table
        {...props}
        style={{
          border: '1px solid transparent',
          borderCollapse: 'collapse',
          margin: '0 auto',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {children}
      </table>
    </div>
  ),
  tbody: ({ children, ...props }: RendererProps) => (
    <tbody {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }: RendererProps) => <tr {...props}>{children}</tr>,
  th: ({ children, ...props }: RendererProps) => (
    <th
      {...props}
      style={{
        border: '1px solid black',
        backgroundColor: '#FEEF8B',
        padding: '8px',
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'black',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: RendererProps) => (
    <td
      {...props}
      style={{
        border: '1px solid black',
        backgroundColor: 'transparent',
        padding: '8px',
        textAlign: 'left',
      }}
    >
      {children}
    </td>
  ),
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as='h1' size={'4xl'} _dark={{ color: 'yellow.200' }} {...props}>
      {props.children}
      <hr
        style={{ marginBottom: 10, border: '0.3px solid rgb(121, 121, 121)' }}
      />
    </Heading>
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as='h2' size={'3xl'} _dark={{ color: 'yellow.200' }} {...props}>
      {props.children}
    </Heading>
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as='h3' size={'2xl'} _dark={{ color: 'yellow.200' }} {...props}>
      {props.children}
    </Heading>
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as='h4' size={'xl'} _dark={{ color: 'yellow.200' }} {...props}>
      {props.children}
    </Heading>
  ),
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading as='h5' size={'lg'} _dark={{ color: 'yellow.200' }} {...props}>
      {props.children}
    </Heading>
  ),
  // styles for ul , ol , li
  ul: ({ children, ...props }: RendererProps) => (
    <ul style={{ listStyleType: 'disc', marginLeft: '20px' }} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: RendererProps) => (
    <ol style={{ listStyleType: 'decimal', marginLeft: '20px' }} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: RendererProps) => (
    <li style={{ marginBottom: '10px' }} {...props}>
      {children}
    </li>
  ),
  p: ({ children, ...props }: RendererProps) => (
    <p style={{ paddingLeft: 5, marginBottom: '10px' }} {...props}>
      {children}
    </p>
  ),
  iframe: ({ src, ...props }: RendererProps) => (
    <center>
      <iframe
        {...props}
        src={src}
        style={{
          borderRadius: '10px',
          marginBottom: '10px',
          maxWidth: '100%',
          minWidth: '100%',
          aspectRatio: '16/9',
          height: '100%',
          border: '2px grey solid',
        }}
      />
    </center>
  ),
  center: ({ children, ...props }: RendererProps) => (
    <div style={{ textAlign: 'center' }} {...props}>
      {children}
    </div>
  ),
};

export default MarkdownRenderers;
