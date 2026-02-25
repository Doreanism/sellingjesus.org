
<template lang='pug'>

BookBase(:strings='strings' :convo_general='convo_general' :convo_corinthians='convo_corinthians' :articles_data='articles_data' :pages_data='pages_data')

</template>


<script lang='ts' setup>

import BookBase from '@/book_contents/BookBase.vue'
import convo_general from '../learn/conversations_processed.json'
import convo_corinthians from '../learn/corinthians_processed.json'
import {data as articles_data} from './book_articles.data'
import {data as pages_data} from './pages.data'

const strings = {
    title: 'Abolir o Comércio de Jesus',
    title_line1: 'Abolir',
    title_line2: 'o Comércio de Jesus',
    subtitle: 'Abolir o Comércio de Jesus: Espalhe a Alegria de Dar Gratuitamente',
    authors: 'Por Andrew Case, Conley Owens, Jon Here e outros colaboradores',
    publisher_prefix: 'Publicado por',
    publisher_name: 'Selling Jesus',
    edition: 'Primeira edição (2025)',
    license_text: 'Este livro é dado gratuitamente para a glória de Deus e dedicado ao domínio público. Ele pode ser copiado, traduzido, adaptado, no todo ou em parte, sem a necessidade de pedir permissão. Você também pode acessar este conteúdo online em sellingjesus.org.',
    quote1_stanza1: 'Seus líderes dão sentença por suborno;\nseus sacerdotes ensinam por um preço;\nseus profetas praticam adivinhação por dinheiro.',
    quote1_stanza2: 'Ainda assim, eles se apoiam em Yahweh e dizem,\n"Não está Yahweh em nosso meio?\nNenhum desastre virá sobre nós."',
    quote1_ref: 'Miqueias 3:11',
    quote2_body: "Pois nós não somos, como tantos, mercadores da palavra de Deus, mas como homens de sinceridade, como comissionados por Deus, na presença de Deus falamos em Cristo.",
    quote2_ref: '2 Coríntios 2:17',
    toc_title: 'Conteúdo',
    toc_foreword: 'Prefácio',
    toc_intro: 'Introdução',
    toc_conclusion: 'Conclusão',
    foreword_title: 'Prefácio',
    intro_title: 'Introdução',
    intro_subtitle: 'Uma Distopia Cristã?',
    section_conversations: 'Conversas',
    convo_general_title: 'Conversas sobre Vender Jesus',
    convo_general_intro: 'Os dois capítulos a seguir são conversas fictícias. A primeira é entre um jovem chamado Tim e seu pastor. Seu formato e estilo de conversa têm a intenção de ajudar a torná-las mais legíveis. Esperamos que sirva como uma introdução simples a alguns dos tópicos fundamentais deste livro. Artigos formais seguirão, examinando as Escrituras com maior profundidade.',
    convo_corinthians_title: 'Conversas entre Paulo e os Coríntios',
    profiles_title_text: 'Cristãos Que Vendem Jesus',
    conclusion_title: 'Conclusão',
}

</script>
