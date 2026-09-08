# Conteúdo exclusivo por organização

A área **Conteúdo exclusivo** usa uma estrutura genérica por organização. Nenhum cliente é codificado no frontend ou nas policies.

## Estrutura

- `organizations`: cadastro do cliente/organização.
- `organization_members`: e-mails autorizados e vínculo opcional com `auth.users`.
- `organization_contents`: relação entre organização e conteúdo.
- `exclusive_contents.access_scope`: `global` ou `organization`.

## Acesso

O admin cria a organização, autoriza um e-mail e associa conteúdos. Se o e-mail ainda não possuir conta, o vínculo com `auth.users` acontece automaticamente no cadastro. O acesso efetivo é validado por RLS e também protege os arquivos do bucket privado `exclusive-media`.

A área `/meu-espaco` continua separada e não é usada para os conteúdos exclusivos desta funcionalidade.
