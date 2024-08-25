  'use client';
  
  import Image from "next/image"
  import { useEffect, useState } from "react"
  
  import type { FormProps } from 'antd'
  import { Button, Checkbox, Form, Input, Table } from 'antd'
  import { ConfigProvider, theme } from 'antd'

  type WordResult = {
    word: string;
    score: number | undefined;
    givenLetters: string;
    keptLetters: string;
  };
  
  export default function Home() {

    const [dictionary, setDictionary] = useState<string[]>([]);
    const [possibleWords, setPossibleWords] = useState<WordResult[]>([]);

    const loadDictionary = async () => {
      let response = await fetch('ods6.txt.max7')
      const words = await response.text()
      response = await fetch("dico_include_exclude.list")
      const includeExclude = await response.text()
      let dico = words.split('\n')
      const wordsToRemove: string[] = []
      const wordsToAdd: string[] = []
      for (const word of includeExclude.split('\n')) {
        if (word.startsWith('!')) {
          wordsToRemove.push(word.substring(1))
        } else {
          wordsToAdd.push(word)
        }
      }
      dico.push(...wordsToAdd)
      dico = dico.filter((word) => !wordsToRemove.includes(word))
      dico = dico.filter((word) => word.length > 0)
      setDictionary(dico);
    };

    useEffect(() => {
      loadDictionary();
    }, []);
    
    type FieldType = {
      givenLetters?: string;
      layout?: string;
      letters?: string;
    };

    type LetterScoresType = {
      [key: string]: number;
    };

    const letter_score: LetterScoresType = {
      "A" : 1,
      "B" : 3,
      "C" : 3,
      "D" : 2,
      "E" : 1,
      "F" : 4,
      "G" : 2,
      "H" : 4,
      "I" : 1,
      "J" : 8,
      "K" : 10,
      "L" : 1,
      "M" : 2,
      "N" : 1,
      "O" : 1,
      "P" : 3,
      "Q" : 8,
      "R" : 1,
      "S" : 1,
      "T" : 1,
      "U" : 1,
      "V" : 4,
      "W" : 10,
      "X" : 10,
      "Y" : 10,
      "Z" : 10,
      "*" : 0
    };

    const processWords = (givenLetters: string, layout: string, letters: string) => {
      const possibleWords: WordResult[] = []
      for (const word of dictionary) {
        const wordResult: WordResult = processWord(word, givenLetters, letters, layout)
        if (wordResult.score != undefined) {
          possibleWords.push(wordResult)
        }
      }
      return possibleWords
    }
    
    const processWord = (word: string, givenLetters: string, letters: string, layout: string): WordResult => {
      let given_letters = ''
      let kept_letters = ''
      let score = 0
      let letter_idx = 0
      let player_letters = letters
      let opponent_letters = givenLetters
      for (const letter of word.toUpperCase()) {
        let joker = false
        if (opponent_letters.includes(letter)) {
          opponent_letters = opponent_letters.replace(letter, '')
        } else if (player_letters.includes(letter)) {
          player_letters = player_letters.replace(letter, '')
        } else if (opponent_letters.includes('*')) {
          opponent_letters = opponent_letters.replace('*', '')
          joker = true
        } else if (player_letters.includes('*')) {
          player_letters = player_letters.replace('*', '')
          joker = true
        } else {
          return {word: word, score: undefined, givenLetters: '', keptLetters: ''}
        }
        const played_letter = joker ? '*' : letter
        if (layout[letter_idx] == 'W') {
          given_letters += played_letter
        }
        const board_card = layout[letter_idx]
        if (board_card == '2') {
          score += 2 * letter_score[played_letter]
        } else if (board_card == '3') {
          score += 3 * letter_score[played_letter]
        } else if (board_card == '+') {
          score += 10
          score += letter_score[played_letter]
        } else {
          score += letter_score[played_letter]
        }
        letter_idx += 1
      }
      if (opponent_letters.length == 0) {
        score *= 2
      }
      for (const letter of opponent_letters) {
        score -= letter_score[letter]
      }
      kept_letters = player_letters
      return {word: word, score: score, givenLetters: given_letters, keptLetters: kept_letters}
    }


    
    const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
      console.log('Success:', values);
      if (values.givenLetters === undefined || values.layout === undefined || values.letters === undefined) {
        return;
      }
      const words: WordResult[] = processWords(
        values.givenLetters.toUpperCase().replace(/[^A-Z*]/gi, ''), 
        values.layout.toUpperCase(), 
        values.letters.toUpperCase().replace(/[^A-Z*]/gi, '')
      );

      // Sort words by score
      words.sort((a, b) => {
        if (a.score === undefined || b.score === undefined) {
          return 1;
        }
        if (a.score === b.score) {
          return a.word.localeCompare(b.word);
        }
        return b.score - a.score;
      });

      setPossibleWords(words);

      console.log(words);

    };
    
    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
      console.log('Failed:', errorInfo);
    };
    return (
      <main>
      <ConfigProvider
      theme={{
        // 1. Use dark algorithm
        algorithm: theme.darkAlgorithm,
        
        // 2. Combine dark algorithm and compact algorithm
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}
      >
      <Form
      name="letters-and-layout"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      >
      <Form.Item<FieldType>
      label="Given Letters"
      name="givenLetters"
      rules={[{ required: true, message: 'up to 2 letters' }]}
      >
      <Input placeholder='0, 1 or 2 letters given by opponent, "*" for joker'/>
      </Form.Item>
      
      <Form.Item<FieldType>
      label="Layout"
      name="layout"

      rules={[{ required: true, message: "7 characters" }]}
      >
      <Input placeholder='"2" for x2, "3" for x3, "w" for sent letters and "+" for +10'/>
      </Form.Item>
      
      <Form.Item<FieldType>
      label="Letters"
      name="letters"
      rules={[{ required: true, message: 'up to 7 characters' }]}
      >
      <Input placeholder='up to 7 letters, "*" for joker'/>
      </Form.Item>
      
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
      <Button type="primary" htmlType="submit">
      Submit
      </Button>
      </Form.Item>
      </Form>
      <Table dataSource={possibleWords} columns={[
        {title: 'Word', dataIndex: 'word', key: 'word'},
        {title: 'Score', dataIndex: 'score', key: 'score'},
        {title: 'Given Letters', dataIndex: 'givenLetters', key: 'givenLetters'},
        {title: 'Kept Letters', dataIndex: 'keptLetters', key: 'keptLetters'},
      ]} />

      </ConfigProvider>
      </main>
    );
  }
  