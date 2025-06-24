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
  code: ({ children, ...props }: RendererProps) => (
    <code
      {...props}
      style={{
        backgroundColor: '#0d1117', // Dark GitHub-like background
        color: 'primary',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '0.85em',
        fontFamily:
          '"Fira Code", "JetBrains Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        border: '1px solid #30363d', // Subtle border
        boxShadow:
          '0 2px 8px rgba(13, 17, 23, 0.4), inset 0 1px 0 rgba(125, 211, 252, 0.1)',
        display: 'inline',
        maxWidth: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        verticalAlign: 'baseline',
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
        position: 'relative',
      }}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: RendererProps) => (
    <div
      style={{
        background:
          'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
        borderRadius: '12px',
        border: '1px solid #30363d',
        boxShadow: '0 8px 32px rgba(13, 17, 23, 0.6)',
        margin: '20px 0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.2), transparent)',
          height: '1px',
          width: '100%',
        }}
      />
      <pre
        {...props}
        style={{
          backgroundColor: 'transparent',
          color: '#f0f6fc',
          padding: '20px',
          margin: '0',
          overflow: 'auto',
          fontSize: '0.9em',
          fontFamily:
            '"Fira Code", "JetBrains Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          lineHeight: '1.6',
          maxWidth: '100%',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          scrollbarWidth: 'thin',
          scrollbarColor: '#30363d #161b22',
        }}
      >
        <span
          style={{
            color: '#7dd3fc',
            textShadow: '0 0 10px rgba(125, 211, 252, 0.3)',
          }}
        >
          {children}
        </span>
      </pre>
    </div>
  ),
};

export default MarkdownRenderers;
