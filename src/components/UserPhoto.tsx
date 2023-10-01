import React, {useMemo, useState, useCallback} from 'react';
import {StyleProp, TextStyle, ViewStyle} from 'react-native';
import ImageView from 'react-native-image-viewing';
import Profile from '../HomeScreen/Profile';

// Props 선언
interface UserPhotoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageUrl?: string;
  name?: string;
  nameStyle?: StyleProp<TextStyle>;
}

const UserPhoto = ({
  size = 48,
  style,
  imageUrl,
  name,
  nameStyle,
}: UserPhotoProps) => {
  // ImageView 를 보여줄지 말지에 대한 State
  const [viewerVisible, setViewrVisible] = useState(false);

  const images = useMemo(
    // imageUrl 이 있는 경우 uri 에 imageUrl 을 넣어주고 없는 경우 빈 배열
    () => (imageUrl != null ? [{uri: imageUrl}] : []),
    [imageUrl],
  );

  const showImageViewer = useCallback(() => {
    setViewrVisible(true);
  }, []);

  return (
    <>
      <Profile
        size={size}
        style={style}
        imageUrl={imageUrl}
        // 보여줄 이미지가 있을 경우 showImageViewer 함수를 실행하여 true 로 변경, 아닐경우 undefined -> 작동 x
        onPress={images.length > 0 ? showImageViewer : undefined}
        // User name 의 첫 글자 index 가져오기 -> UpperCase 로 소문자일 경우 대문자로 치환
        text={name?.[0].toUpperCase()}
        textStyle={nameStyle}
      />
      <ImageView
        images={images}
        imageIndex={0}
        visible={viewerVisible}
        // 닫는 요청이 들어올 경우 State 를 false 로 변경
        onRequestClose={() => setViewrVisible(false)}
      />
    </>
  );
};

export default UserPhoto;
