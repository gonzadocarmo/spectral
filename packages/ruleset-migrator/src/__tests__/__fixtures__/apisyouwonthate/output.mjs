import { truthy, pattern, schema, falsy, enumeration } from '@stoplight/spectral-functions';
import { oas2, oas3 } from '@stoplight/spectral-formats';
export default {
  rules: {
    'api-home': {
      description:
        'APIs MUST have a root path defined (`/`), to stop forcing all API consumers to visit documentation for basic interactions.',
      severity: 'error',
      given: '$.paths',
      then: {
        field: '/',
        function: truthy,
      },
    },
    'api-home-get': {
      description: "APIs root path MUST have a GET defined, otherwise people won't know how to get it.",
      severity: 'error',
      given: '$.paths[/]',
      then: {
        field: 'get',
        function: truthy,
      },
    },
    'paths-kebab-case': {
      description: 'Should paths be kebab-case.',
      message: '{{property}} should be kebab-case (lower case and separated with hyphens)',
      severity: 'warn',
      given: '$.paths[*]~',
      then: {
        function: pattern,
        functionOptions: {
          match: '^(/|[a-z0-9-.]+|{[a-zA-Z0-9_]+})+$',
        },
      },
    },
    'no-http-basic': {
      description: 'Consider a more secure alternative to HTTP Basic.',
      message: 'HTTP Basic is a pretty insecure way to pass credentials around, please consider an alternative.',
      severity: 'warn',
      given: '$.components.securitySchemes[*]',
      then: {
        field: 'scheme',
        function: pattern,
        functionOptions: {
          notMatch: 'basic',
        },
      },
    },
    'no-x-headers': {
      description: 'Please do not use headers with X-',
      message:
        'Headers cannot start with X-, so please find a new name for {{property}}. More: https://tools.ietf.org/html/rfc6648',
      given: "$..parameters.[?(@.in === 'header')].name",
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '^(x|X)-',
        },
      },
    },
    'request-GET-no-body': {
      description: 'A `GET` request MUST NOT accept a `body` parameter',
      severity: 'error',
      given: '$.paths..get.parameters..in',
      then: {
        function: pattern,
        functionOptions: {
          notMatch: '/^body$/',
        },
      },
    },
    'headers-hyphenated-pascal-case': {
      description: 'All `HTTP` headers MUST use `Hyphenated-Pascal-Case` notation',
      severity: 'error',
      given: "$..parameters[?(@.in == 'header')].name",
      message: "'HTTP' headers MUST follow 'Hyphenated-Pascal-Case' notation",
      type: 'style',
      then: {
        function: pattern,
        functionOptions: {
          match: '/^([A-Z][a-z0-9]-)*([A-Z][a-z0-9])+/',
        },
      },
    },
    'oas2-hosts-https-only': {
      description: 'ALL requests MUST go through `https` protocol only',
      severity: 'error',
      formats: [oas2],
      type: 'style',
      message: 'Schemes MUST be https and no other value is allowed.',
      given: '$.schemes',
      then: {
        function: schema,
        functionOptions: {
          schema: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['https'],
            },
            maxItems: 1,
          },
        },
      },
    },
    'oas3-hosts-https-only': {
      description: 'ALL requests MUST go through `https` protocol only',
      formats: [oas3],
      severity: 'error',
      message: 'Servers MUST be https and no other protocol is allowed.',
      given: '$.servers..url',
      then: {
        function: pattern,
        functionOptions: {
          match: '/^https:/',
        },
      },
    },
    'oas3-request-support-json': {
      description: 'Every request SHOULD support `application/json` media type',
      formats: [oas3],
      severity: 'warn',
      message: '{{description}}: {{error}}',
      given: "$.paths.[*].requestBody.content[?(@property.indexOf('json') === -1)]^",
      then: {
        function: falsy,
      },
    },
    'unknown-error-format': {
      description:
        'Every error response SHOULD support either RFC 7807 (https://tools.ietf.org/html/rfc6648) or the JSON:API Error format.',
      formats: [oas3],
      severity: 'warn',
      given: '$.paths.[*].responses[?(@property.match(/^(4|5)/))].content.*~',
      then: {
        function: enumeration,
        functionOptions: {
          values: ['application/vnd.api+json', 'application/problem+xml', 'application/problem+json'],
        },
      },
    },
  },
};
