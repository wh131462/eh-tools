import React, {useEffect, useState} from 'react';
import {View} from '@tarojs/components';
import {Button, Cell, Dialog} from '@nutui/nutui-react-taro';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {useTranslation} from '@/i18n';
import {formatDate} from '@/utils/date';
import {deleteRecord} from '@/store/slices/game2048Slice';
import {updatePageTitle} from '@/i18n/utils';
import './index.less';

const Game2048History: React.FC = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const records = useAppSelector(state => state.game2048.records);
  const {language} = useAppSelector(state => state.app);
  const [visible, setVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [sortBy, setSortBy] = useState<'time' | 'score'>('time');
  const [sortedRecords, setSortedRecords] = useState(records);

  useEffect(() => {
    updatePageTitle(language, 'history');
  }, [language]);

  useEffect(() => {
    const sorted = [...records].sort((a, b) => {
      if (sortBy === 'time') {
        return b.timestamp - a.timestamp;
      } else {
        return b.score - a.score;
      }
    });
    setSortedRecords(sorted);
  }, [records, sortBy]);

  return (
    <View className='game2048-history'>
      <View className='sort-buttons'>
        <Button
          type={sortBy === 'time' ? 'primary' : 'default'}
          onClick={() => setSortBy('time')}
        >
          {t('sortByTime')}
        </Button>
        <Button
          type={sortBy === 'score' ? 'primary' : 'default'}
          onClick={() => setSortBy('score')}
        >
          {t('sortByScore')}
        </Button>
      </View>
      <Cell.Group>
        {sortedRecords.length === 0 ? (
          <Cell>
            <View className='no-records'>{t('noRecords')}</View>
          </Cell>
        ) : (
          sortedRecords.map(record => (
            <View key={record.id} className='record-item'>
              <Cell
                title={record.nickname}
                description={formatDate(record.timestamp)}
                extra={
                  <View className='record-actions'>
                    <View className='score'>{t('score')}: {record.score}</View>
                    <Button
                      type='primary'
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(record.id);
                        setVisible(true);
                      }}
                    >
                      {t('deleteRecord')}
                    </Button>
                  </View>
                }
              />
              <Dialog
                visible={visible && selectedId === record.id}
                onClose={() => setVisible(false)}
                title={t('info')}
                content={t('deleteRecordConfirm')}
                confirmText={t('confirm')}
                cancelText={t('cancel')}
                onCancel={() => setVisible(false)}
                onConfirm={() => {
                  dispatch(deleteRecord(record));
                  setVisible(false);
                }}
              />
            </View>
          ))
        )}
      </Cell.Group>
    </View>
  );
};

export default Game2048History;
