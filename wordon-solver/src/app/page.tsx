  'use client';
  
  import Image from "next/image"
  import { useEffect, useState } from "react"
  
  import type { FormProps } from 'antd'
  import { Button, Checkbox, Form, Input, Table, Tag } from 'antd'
  import { ConfigProvider, theme } from 'antd'
  
  type WordResult = {
    word: Letter[];
    score: number | undefined;
    givenLetters: Letter[];
    keptLetters: Letter[];
    key?: number;
  };

  type Letter = {
    letter: string;
    isJoker: boolean;
    isGiven: boolean;
  }
  
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
    
    const processWord = (word: string, opponentLetters: string, playerLetters: string, layout: string): WordResult => {
      let givenLetters: Letter[] = []
      let keptLetters: Letter[] = []
      let score = 0
      let letterIdx = 0
      let wordLetters: Letter[] = []
      for (const letter of word.toUpperCase()) {
        let playedLetter: Letter|undefined = undefined
        if (opponentLetters.includes(letter)) {
          opponentLetters = opponentLetters.replace(letter, '')
          playedLetter = {letter: letter, isJoker: false, isGiven: true}
        } else if (playerLetters.includes(letter)) {
          playerLetters = playerLetters.replace(letter, '')
          playedLetter = {letter: letter, isJoker: false, isGiven: false}
        } else if (opponentLetters.includes('*')) {
          opponentLetters = opponentLetters.replace('*', '')
          playedLetter = {letter: letter, isJoker: true, isGiven: true}
        } else if (playerLetters.includes('*')) {
          playerLetters = playerLetters.replace('*', '')
          playedLetter = {letter: letter, isJoker: true, isGiven: false}
        } else {
          return {word: [], score: undefined, givenLetters: [], keptLetters: []}
        }
        wordLetters.push(playedLetter)
        if (layout[letterIdx] == 'W') {
          if (playedLetter.isJoker) {
            givenLetters.push({letter: '*', isJoker: true, isGiven: playedLetter.isGiven})
          } else {
            givenLetters.push(playedLetter)
          }
        }
        const boardCard = layout[letterIdx]
        if (!playedLetter.isJoker) {
          if (boardCard == '2') {
            score += 2 * letter_score[playedLetter.letter]
          } else if (boardCard == '3') {
            score += 3 * letter_score[playedLetter.letter]
          } else {
            score += letter_score[playedLetter.letter]
          }
        }
        if (boardCard == '+') {
          score += 10
        }
        letterIdx += 1
      }
      if (opponentLetters.length == 0) {
        score *= 2
      }
      for (const letter of opponentLetters) {
        score -= letter_score[letter]
      }
      keptLetters = []
      for (const letter of playerLetters) {
        keptLetters.push({letter: letter, isJoker: letter=="*", isGiven: false} )
      }
      return {word: wordLetters, score: score, givenLetters: givenLetters, keptLetters: keptLetters}
    }
    
    const lettersValue = (letters: string) => {
      let value = 0
      if (letters.includes('*')) {
        value += 100
      }
      const nb_vowels = letters.match(/[AEIOUY]/)?.length || 0
      const nb_consonants = letters.match(/[BCDFGHJKLMNPQRSTVWXZ]/)?.length || 0
      value -= Math.abs(nb_vowels - nb_consonants)
      return value
    }

    const letters2String = (letters: Letter[]) => {
      let str = ''
      for (const letter of letters) {
        str += letter.letter
      }
      return str
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
        if (a.score != b.score) {
          return b.score - a.score
        }
        const a_kvalue = lettersValue(letters2String(a.keptLetters))
        const b_kvalue = lettersValue(letters2String(b.keptLetters))
        const a_gvalue = lettersValue(letters2String(a.givenLetters))
        const b_gvalue = lettersValue(letters2String(b.givenLetters))
        const a_value = a_kvalue - a_gvalue
        const b_value = b_kvalue - b_gvalue
        if (a_value != b_value) {
          return b_value - a_value
        }

        return letters2String(a.word).localeCompare(letters2String(b.word))
      });
      
      // add unique key to each word
      words.forEach((word, index) => {
        word.key = index;
      });

      setPossibleWords(words);
      
      console.log(words);
      
    };

    const tiles = (word: Letter[]) => {
      
      return (
        <div style={{whiteSpace: "nowrap"}}>
          {word.map((letter, index) => {
            const tagColor = letter.isGiven?'#ddba18':'white'
            const letterTag = letter.isJoker?"<i>":"<b>"
            return <Tag style={{marginInlineEnd: "2px", width: "23px"}} color={tagColor}>
              <span style={{ color:letter.letter=="*"?tagColor:letter.isGiven?"#c34600":"black"}} className="notranslate">
                {letter.isJoker? <u>{letter.letter}</u> : <b>{letter.letter}</b>}
              </span>
            </Tag>
          })}
        </div>
      )
    }
    
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
        </Form>.
        <Table dataSource={possibleWords} columns={[
          {title: 'Word', dataIndex: 'word', 
            render: (text) => tiles(text) },
          {title: 'Score', dataIndex: 'score',
            render: (text) => <b>{text}</b>
          },
          {title: 'Given Letters', dataIndex: 'givenLetters', 
            render: (text) => tiles(text) },
          {title: 'Kept Letters', dataIndex: 'keptLetters', 
            render: (text) => tiles(text) },
        ]} size="middle"/>
      
      </ConfigProvider>
      </main>
    );
  }
  