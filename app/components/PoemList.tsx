import { useState, useEffect } from 'react';
import { Poem, DifficultyLevel, loadPoemsByDifficulty, getDifficultyName } from '@/lib/utils';

interface PoemListProps {
  difficulty: DifficultyLevel;
}

const PoemList = ({ difficulty }: PoemListProps) => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPoems = async () => {
      setLoading(true);
      const data = await loadPoemsByDifficulty(difficulty);
      setPoems(data);
      setLoading(false);
    };

    loadPoems();
  }, [difficulty]);

  if (loading) {
    return <div className="text-center py-8">正在加载{getDifficultyName(difficulty)}诗词...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{getDifficultyName(difficulty)}诗词列表</h2>
      <div className="grid gap-4">
        {poems.map((poem) => (
          <div key={poem.num} className="p-4 border rounded-lg hover:bg-gray-50">
            <h3 className="text-lg font-semibold">{poem.title}</h3>
            <p className="text-gray-600">{poem.author}</p>
            <p className="mt-2 whitespace-pre-line">{poem.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoemList;