-- 创建一个触发器函数，在用户注册时自动创建用户配置文件
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, xp, level, ai_personality, daily_goal_count)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'xp')::int, 0),
    COALESCE((NEW.raw_user_meta_data->>'level')::int, 1),
    COALESCE(NEW.raw_user_meta_data->>'ai_personality', 'warm'),
    COALESCE((NEW.raw_user_meta_data->>'daily_goal_count')::int, 5)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除现有触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建触发器，在新用户注册时调用触发器函数
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
