import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: corsHeaders,
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {
    const authHeader =
      req.headers.get('Authorization') ?? ''

    const url =
      Deno.env.get('SUPABASE_URL')!

    const anon =
      Deno.env.get('SUPABASE_ANON_KEY')!

    const service =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const caller = createClient(url, anon, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    const admin = createClient(url, service)

    const {
      data: { user },
      error: userError,
    } = await caller.auth.getUser()

    if (userError || !user) {
      throw new Error('Sessione non valida')
    }

    const { data: callerProfile } = await admin
      .from('profiles')
      .select('ruolo,attivo')
      .eq('id', user.id)
      .single()

    if (
      !callerProfile?.attivo ||
      callerProfile.ruolo !== 'admin'
    ) {
      return json(
        {
          error: 'Operazione riservata a Lorenzo',
        },
        403,
      )
    }

    const body = await req.json()

    if (body.action === 'list') {
      const [
        {
          data: authData,
          error: authError,
        },
        {
          data: profiles,
          error: profileError,
        },
      ] = await Promise.all([
        admin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        }),

        admin
          .from('profiles')
          .select('id,nome,ruolo,attivo')
          .order('nome'),
      ])

      if (authError) throw authError
      if (profileError) throw profileError

      const byId = new Map(
        (authData.users || []).map((u) => [
          u.id,
          u,
        ]),
      )

      return json({
        ok: true,

        users: (profiles || []).map((p) => ({
          ...p,
          email: byId.get(p.id)?.email || '',
        })),
      })
    }

    if (body.action === 'create') {
      if (
        !body.nome ||
        !body.email ||
        !body.password
      ) {
        throw new Error(
          'Nome, email e password sono obbligatori',
        )
      }

      const { data, error } =
        await admin.auth.admin.createUser({
          email: body.email,
          password: body.password,
          email_confirm: true,

          user_metadata: {
            nome: body.nome,
          },
        })

      if (error) throw error

      const { error: profileError } = await admin
        .from('profiles')
        .upsert({
          id: data.user.id,
          nome: body.nome,
          ruolo: 'dipendente',
          attivo: true,
        })

      if (profileError) throw profileError

      return json({
        ok: true,
        user_id: data.user.id,
      })
    }

    if (body.action === 'update') {
      if (
        !body.user_id ||
        !body.nome ||
        !body.email
      ) {
        throw new Error(
          'Dati utente incompleti',
        )
      }

      if (
        body.user_id === user.id &&
        (
          body.ruolo !== 'admin' ||
          body.attivo === false
        )
      ) {
        throw new Error(
          'Non puoi disattivare il tuo account o toglierti il ruolo amministratore',
        )
      }

      const { error: authError } =
        await admin.auth.admin.updateUserById(
          body.user_id,
          {
            email: body.email,
            email_confirm: true,

            user_metadata: {
              nome: body.nome,
            },
          },
        )

      if (authError) throw authError

      const { error: profileError } = await admin
        .from('profiles')
        .update({
          nome: body.nome,

          ruolo:
            body.ruolo === 'admin'
              ? 'admin'
              : 'dipendente',

          attivo: body.attivo !== false,
        })
        .eq('id', body.user_id)

      if (profileError) throw profileError

      return json({
        ok: true,
      })
    }

    if (body.action === 'password') {
      if (
        !body.password ||
        body.password.length < 8
      ) {
        throw new Error(
          'La password deve avere almeno 8 caratteri',
        )
      }

      const { error } =
        await admin.auth.admin.updateUserById(
          body.user_id,
          {
            password: body.password,
          },
        )

      if (error) throw error

      return json({
        ok: true,
      })
    }

    if (body.action === 'usage') {
      const { data, error } = await admin.rpc(
        'overgreen_project_usage',
      )

      if (error) {
        throw new Error(
          `Monitor utilizzo non configurato: ${error.message}`,
        )
      }

      const usage =
        Array.isArray(data)
          ? data[0]
          : data

      return json({
        ok: true,

        database_bytes:
          Number(usage?.database_bytes) || 0,

        storage_bytes:
          Number(usage?.storage_bytes) || 0,

        storage_objects:
          Number(usage?.storage_objects) || 0,
      })
    }

    if (body.action === 'delete_intervention') {
      if (!body.intervention_id) throw new Error('Intervento non indicato')
      const {data, error} = await caller.rpc('overgreen_admin_v198', {
        p_request_id: body.request_id || body.intervention_id,
        p_operation: 'delete_intervention',
        p_payload: {id: body.intervention_id},
      })
      if (error) throw error
      let cleanupWarning = null
      if (data.paths?.length) {
        const cleanup = await admin.storage.from('documenti').remove(data.paths)
        cleanupWarning = cleanup.error?.message || null
      }
      return json({ok: true, cleanup_warning: cleanupWarning})
    }

    return json(
      {
        error: 'Azione non valida',
      },
      400,
    )
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      400,
    )
  }
})
